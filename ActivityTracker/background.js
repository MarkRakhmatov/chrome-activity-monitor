function getUrlHostname(urlString) {
    return new URL(urlString).hostname;
}

function getWeekDay() {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const d = new Date();
    return weekdays[d.getDay()];
}

function zeroPrefixedNum(num, width) {
    const numStr = num.toString();
    const numSize = numStr.length;
    let prefix = '';
    let prefixSize = width - numSize;
    while (prefixSize--) {
        prefix += 0;
    }
    return prefix + numStr;
}

class Duration {
    constructor(milliseconds) {
        const msInSeconds = 1000;
        const msInMinutes = 60 * msInSeconds;
        const msInHours = 60 * msInMinutes;

        this.hours = Math.floor(milliseconds / msInHours);
        milliseconds -= this.hours * msInHours;
        this.minutes = Math.floor(milliseconds / msInMinutes);
        milliseconds -= this.minutes * msInMinutes;
        this.seconds = Math.floor(milliseconds / msInSeconds);
        milliseconds -= this.seconds * msInSeconds;
        this.milliseconds = Math.floor(milliseconds);
    }

    toString() {
        return '' + zeroPrefixedNum(this.hours, 2) +
            ':' + zeroPrefixedNum(this.minutes, 2) +
            ':' + zeroPrefixedNum(this.seconds, 2) +
            ':' + zeroPrefixedNum(this.milliseconds, 3);
    }
}

class Timer {
    constructor() {
        this.reset();
    }

    reset() {
        this.activeTimeDuration = 0;
        this.isActive = false;
        this.lastTimePoint = 0;
    }

    start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.lastTimePoint = Date.now();
    }

    pause() {
        if (!this.isActive) {
            return;
        }
        this.updateElapsedTimeDuration();
        this.isActive = false;
    }

    updateElapsedTimeDuration() {
        if (!this.isActive) {
            return;
        }
        let timeNow = Date.now();
        this.activeTimeDuration += timeNow - this.lastTimePoint;
        this.lastTimePoint = timeNow;
    }

    getElapsedTimeDuration() {
        this.updateElapsedTimeDuration();
        return new Duration(this.activeTimeDuration);
    }

    fromMiliseconds(miliseconds) {
        this.activeTimeDuration = miliseconds;
        this.lastTimePoint = 0;
        this.isActive = false;
    }

    getElapsedMilliseconds() {
        this.updateElapsedTimeDuration();
        return this.activeTimeDuration;
    }
}

// contains info about url hostname, opened tabs and
class HostTimeData {
    constructor(tabId) {
        this.timer = new Timer();
        this.timer.start();
        this.tabIds = new Set();
        this.addTab(tabId);
    }

    activate() {
        this.timer.start();
    }

    deactivate() {
        this.timer.pause();
        const timeDuration = this.getActiveTimeDuration();
        console.info(`ActiveTimeDuration: ${timeDuration}`);
    }

    getActiveTimeDuration() {
        return this.timer.getElapsedTimeDuration();
    }

    addTab(tabId) {
        this.tabIds.add(tabId);
    }

    removeTab(tabId) {
        this.tabIds.delete(tabId);
    }

    reset() {
        this.timer.reset();
        this.timer.start();
        this.tabIds.clear();
    }

    toJson() {
        return JSON.stringify({time: this.timer.getElapsedMilliseconds()});
    }

    fromJson(serialValue) {
        const deserialized = JSON.parse(serialValue);
        this.timer.fromMiliseconds(deserialized.time);
		this.tabIds.clear();
    }
}

class StatisticsHandler {
    constructor() {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
    }

    updateHostTimeData(hostname, tabId) {
        if (this.lastHostname.length !== 0 && hostname !== this.lastHostname) {
            this.hostnameToTimeData[this.lastHostname].deactivate();
        }
        let hostTimeData = this.hostnameToTimeData[hostname];
        if (!hostTimeData) {
            this.hostnameToTimeData[hostname] = new HostTimeData(tabId);
            hostTimeData = this.hostnameToTimeData[hostname];
        }
        hostTimeData.activate();
        hostTimeData.addTab(tabId);
        this.lastHostname = hostname;
    }

    deactivate(tabId) {
        console.log('Deactivate statistics timer for tabId: ' + tabId);
        for (let host in this.hostnameToTimeData) {
        	const value = this.hostnameToTimeData[host];
            console.log('Opened tabs: ' + this.hostnameToTimeData[host].tabIds);
            if (value.tabIds.has(tabId)) {
                console.log('User closed tab with hostname: ' + host);
                value.deactivate();
                value.removeTab(tabId);
            }
        }
    }

    deactivateHost(hostname) {
        console.log('Deactivate statistics timer for hostname: ' + hostname);
        let hostTimeData = this.hostnameToTimeData[hostname];
        if (hostTimeData) {
            hostTimeData.deactivate();
        }
    }

    getMapForSerialization() {
        let hostnameToJson = {};
        for (let key in this.hostnameToTimeData) {
            hostnameToJson[key] = this.hostnameToTimeData[key].toJson();
        }
        return JSON.stringify(hostnameToJson);
    }

    initFromSerialMap(serialMap) {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
        for (let key in serialMap) {
            let hostData = new HostTimeData();
            hostData.fromJson(serialMap[key]);
            this.hostnameToTimeData[key] = hostData;
        }
    }

    reset() {
		this.hostnameToTimeData = {};
        this.lastHostname = '';
    }
}

let gStatisticsHandler = new StatisticsHandler();

function updateStatisticsFromTab(tab) {
    if (!tab.url || tab.url.length === 0) {
        return;
    }
    const { url, id } = tab;
    const hostname = getUrlHostname(url);
    console.log('onUpdated url: ' + url);
    console.log('onUpdated hostname: ' + hostname);
    gStatisticsHandler.updateHostTimeData(hostname, id);
}

function updateActiveTabData() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const currTab = tabs[0];
        if (!currTab) {
            console.log('No active tab!');
            return;
        }
        updateStatisticsFromTab(currTab);
    });
}

function setDataToStorage(updatedDataMap) {
    chrome.storage.local.set({stat: updatedDataMap});
}

function getDataFromStorage() {
    chrome.storage.local.get('stat', function (result) {
        if (!result.stat) {
            return;
        }

        let serializedMap = JSON.parse(result.stat);
        if (serializedMap) {
            gStatisticsHandler.initFromSerialMap(serializedMap);
        }
    });
}

function setListeners() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.discarded !== undefined) {
            console.log('onUpdated discarded: ' + changeInfo.discarded);
        }
        updateStatisticsFromTab(tab);
    });

    chrome.tabs.onActivated.addListener(function (activeInfo) {
        console.log('onActivated');
        chrome.tabs.get(activeInfo.tabId, updateStatisticsFromTab);
    });

    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        console.log('onRemoved ' + tabId);
        gStatisticsHandler.deactivate(tabId);
        setDataToStorage(gStatisticsHandler.getMapForSerialization());
    });
    chrome.windows.onFocusChanged.addListener(function (number) {
        setDataToStorage(gStatisticsHandler.getMapForSerialization());
        if (number === chrome.windows.WINDOW_ID_NONE) {
            console.log('No active window - will deactivate last hostname');
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                const currTab = tabs[0];
                if (!currTab) {
                    console.log('No active tab!');
                    gStatisticsHandler.deactivateHost(gStatisticsHandler.lastHostname);
                    return;
                }
                updateStatisticsFromTab(currTab);
            });
        } else {
            updateActiveTabData();
        }
    });

    chrome.runtime.onSuspend.addListener(function () {
        updateActiveTabData();
        setDataToStorage(gStatisticsHandler.getMapForSerialization());
    });

    const alarmCreateInfo =
        {
            'delayInMinutes': 1,
            'periodInMinutes': 2
        };
	const activeTabUpdater = 'ActiveTabUpdater';
    chrome.alarms.create(activeTabUpdater, alarmCreateInfo);

    const serializerAlarmCreateInfo =
        {
            'delayInMinutes': 1,
            'periodInMinutes': 2
        };
	const statisticsSerializer = 'StatisticsSerializer';
    chrome.alarms.create(statisticsSerializer, serializerAlarmCreateInfo);

    chrome.alarms.onAlarm.addListener(function (alarm) {
        console.log('Alarm fired: ' + alarm.name);
        if (alarm.name == activeTabUpdater) {
            updateActiveTabData();
        }
        if (alarm.name == statisticsSerializer) {
            setDataToStorage(gStatisticsHandler.getMapForSerialization());
            checkDayChange();
        }
    });

    chrome.runtime.onMessage.addListener((message, sender, response) => {
        if (message === "getStatistics") {
            let hostToTimestamp = {};
            const sortedDataMap = Object.entries(gStatisticsHandler.hostnameToTimeData).sort((a, b) => b[1].timer.getElapsedMilliseconds() - a[1].timer.getElapsedMilliseconds())
            for (let [key, value] of sortedDataMap) {
                hostToTimestamp[key] = value.getActiveTimeDuration().toString();
            }
            response(JSON.stringify(hostToTimestamp));
        }
    });
} 

function onDayChanged() {
    chrome.storage.local.remove('stat', () => {
        if (chrome.runtime.lastError) {
            console.warn("Failed to remove stat from storage " + chrome.runtime.lastError.message);
        } else {
            setDataToStorage('');
            console.log("Removed stat from local storage");
            gStatisticsHandler.reset();
        }
    });
}

function checkDayChange() {
    chrome.storage.local.get('day', function (result) {
        if (result.day) {
            const lastDay = result.day;
            const currentDay = getWeekDay();
            if (lastDay !== currentDay) {
                onDayChanged();
            }
        }
        chrome.storage.local.set({day: getWeekDay()});
    });

}

function initializeStatistics() {
    getDataFromStorage();
    updateActiveTabData();
    setListeners();
}

initializeStatistics();
