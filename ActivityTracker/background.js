function GetUrlHostname(url) {
    let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
    // TODO: rewrite with new URL
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    return hostname;
}

function GetWeekDay() {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let d = new Date();
    return weekdays[d.getDay()];
}

function ZeroPrefixedNum(num, width) {
    let numStr = num.toString();
    let numSize = numStr.length;
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
        return '' + ZeroPrefixedNum(this.hours, 2) +
            ':' + ZeroPrefixedNum(this.minutes, 2) +
            ':' + ZeroPrefixedNum(this.seconds, 2) +
            ':' + ZeroPrefixedNum(this.milliseconds, 3);
    }
}

class Timer {
    constructor() {
        this.Reset();
    }

    Reset() {
        this.activeTimeDuration = 0;
        this.isActive = false;
        this.lastTimePoint = 0;
    }

    Start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.lastTimePoint = Date.now();
    }

    Pause() {
        if (!this.isActive) {
            return;
        }
        this.UpdateElapsedTimeDuration();
        this.isActive = false;
    }

    UpdateElapsedTimeDuration() {
        if (!this.isActive) {
            return;
        }
        let timeNow = Date.now();
        this.activeTimeDuration += timeNow - this.lastTimePoint;
        this.lastTimePoint = timeNow;
    }

    GetElapsedTimeDuration() {
        this.UpdateElapsedTimeDuration();
        return new Duration(this.activeTimeDuration);
    }

    FromMiliseconds(miliseconds) {
        this.activeTimeDuration = miliseconds;
        this.lastTimePoint = 0;
        this.isActive = false;
    }

    GetElapsedMilliseconds() {
        this.UpdateElapsedTimeDuration();
        return this.activeTimeDuration;
    }
}

// contains info about url hostname, opened tabs and
class HostTimeData {
    constructor(tabId) {
        this.timer = new Timer();
        this.timer.Start();
        this.tabIds = new Set();
        this.AddTab(tabId);
    }

    Activate() {
        this.timer.Start();
    }

    Deactivate() {
        this.timer.Pause();
        const timeDuration = this.GetActiveTimeDuration();
        console.info(`ActiveTimeDuration: ${timeDuration}`);
    }

    GetActiveTimeDuration() {
        return this.timer.GetElapsedTimeDuration();
    }

    AddTab(tabId) {
        this.tabIds.add(tabId);
    }

    RemoveTab(tabId) {
        this.tabIds.delete(tabId);
    }

    Reset() {
        this.timer.Reset();
        this.timer.Start();
        this.tabIds.clear();
    }

    ToJson() {
        return JSON.stringify({time: this.timer.GetElapsedMilliseconds()});
    }

    FromJson(serialValue) {
        let deserialized = JSON.parse(serialValue);
        this.timer.FromMiliseconds(deserialized.time);
		this.tabIds.clear();
    }
}

class StatisticsHandler {
    constructor() {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
    }

    UpdateHostTimeData(hostname, tabId) {
        if (this.lastHostname.length !== 0 && hostname !== this.lastHostname) {
            this.hostnameToTimeData[this.lastHostname].Deactivate();
        }
        let hostTimeData = this.hostnameToTimeData[hostname];
        if (!hostTimeData) {
            this.hostnameToTimeData[hostname] = new HostTimeData(tabId);
            hostTimeData = this.hostnameToTimeData[hostname];
        }
        hostTimeData.Activate();
        hostTimeData.AddTab(tabId);
        this.lastHostname = hostname;
        console.log('Map size: ' + this.hostnameToTimeData.size);
    }

    Deactivate(tabId) {
        console.log('Deactivate statistics timer for tabId: ' + tabId);
        for (let host in this.hostnameToTimeData) {
        	const value = this.hostnameToTimeData[host];
            console.log('Opened tabs: ' + this.hostnameToTimeData[host].tabIds);
            if (value.tabIds.has(tabId)) {
                console.log('User closed tab with hostname: ' + host);
                value.Deactivate();
                value.RemoveTab(tabId);
            }
        }
    }

    DeactivateHost(hostname) {
        console.log('Deactivate statistics timer for hostname: ' + hostname);
        let hostTimeData = this.hostnameToTimeData[hostname];
        if (hostTimeData) {
            hostTimeData.Deactivate();
        }
    }

    GetMapForSerialization() {
        let hostnameToJson = {};
        for (let key in this.hostnameToTimeData) {
            hostnameToJson[key] = this.hostnameToTimeData[key].ToJson();
        }
        return JSON.stringify(hostnameToJson);
    }

    InitFromSerialMap(serialMap) {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
        for (let key in serialMap) {
            let hostData = new HostTimeData();
            hostData.FromJson(serialMap[key]);
            this.hostnameToTimeData[key] = hostData;
        }
    }

    Reset() {
		this.hostnameToTimeData = {};
        this.lastHostname = '';
    }
}

let gStatisticsHandler = new StatisticsHandler();

function UpdateStatisticsFromTab(tab) {
    if (!tab.url || tab.url.length === 0) {
        return;
    }
    const { url, id } = tab;
    let hostname = GetUrlHostname(url);
    console.log('onUpdated url: ' + url);
    console.log('onUpdated hostname: ' + hostname);
    gStatisticsHandler.UpdateHostTimeData(hostname, id);
}

function UpdateActiveTabData() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        let currTab = tabs[0];
        if (!currTab) {
            console.log('No active tab!');
            return;
        }
        UpdateStatisticsFromTab(currTab);
    });
}

function SetDataToStorage(updatedDataMap) {
    chrome.storage.local.set({stat: updatedDataMap});
}

function GetDataFromStorage() {
    chrome.storage.local.get('stat', function (result) {
        if (!result.stat) {
            return;
        }

        let serializedMap = JSON.parse(result.stat);
        if (serializedMap) {
            gStatisticsHandler.InitFromSerialMap(serializedMap);
        }
    });
}

function SetListeners() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.discarded !== undefined) {
            console.log('onUpdated discarded: ' + changeInfo.discarded);
        }
        UpdateStatisticsFromTab(tab);
    });

    chrome.tabs.onActivated.addListener(function (activeInfo) {
        console.log('onActivated');
        chrome.tabs.get(activeInfo.tabId, UpdateStatisticsFromTab);
    });

    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        console.log('onRemoved ' + tabId);
        gStatisticsHandler.Deactivate(tabId);
        SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
    });
    chrome.windows.onFocusChanged.addListener(function (number) {
        SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
        if (number === chrome.windows.WINDOW_ID_NONE) {
            console.log('No active window - will deactivate last hostname');
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                let currTab = tabs[0];
                if (!currTab) {
                    console.log('No active tab!');
                    gStatisticsHandler.DeactivateHost(gStatisticsHandler.lastHostname);
                    return;
                }
                UpdateStatisticsFromTab(currTab);
            });
        } else {
            UpdateActiveTabData();
        }
    });

    chrome.runtime.onSuspend.addListener(function () {
        UpdateActiveTabData();
        SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
    });

    let alarmCreateInfo =
        {
            'delayInMinutes': 1,
            'periodInMinutes': 2
        };
    let activeTabUpdater = 'ActiveTabUpdater';
    chrome.alarms.create(activeTabUpdater, alarmCreateInfo);

    let serializerAlarmCreateInfo =
        {
            'delayInMinutes': 1,
            'periodInMinutes': 2
        };
    let statisticsSerializer = 'StatisticsSerializer';
    chrome.alarms.create(statisticsSerializer, serializerAlarmCreateInfo);

    chrome.alarms.onAlarm.addListener(function (alarm) {
        console.log('Alarm fired: ' + alarm.name);
        if (alarm.name == activeTabUpdater) {
            UpdateActiveTabData();
        }
        if (alarm.name == statisticsSerializer) {
            SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
            CheckDayChange();
        }
    });

    chrome.runtime.onMessage.addListener((message, sender, response) => {
        if (message === "getStatistics") {
            let hostToTimestamp = {};
            let sortedDataMap = Object.entries(gStatisticsHandler.hostnameToTimeData).sort((a, b) => b[1].timer.GetElapsedMilliseconds() - a[1].timer.GetElapsedMilliseconds())
            for (let [key, value] of sortedDataMap) {
                hostToTimestamp[key] = value.GetActiveTimeDuration().toString();
            }
            response(JSON.stringify(hostToTimestamp));
        }
    });
}

function OnDayChanged() {
    chrome.storage.local.remove('stat', () => {
        if (chrome.runtime.lastError) {
            console.warn("Failed to remove stat from storage " + chrome.runtime.lastError.message);
        } else {
            SetDataToStorage('');
            console.log("Removed stat from local storage");
            gStatisticsHandler.Reset();
        }
    });
}

function CheckDayChange() {
    chrome.storage.local.get('day', function (result) {
        if (result.day) {
            let lastDay = result.day;
            let currentDay = GetWeekDay();
            if (lastDay !== currentDay) {
                OnDayChanged();
            }
        }
        chrome.storage.local.set({day: GetWeekDay()});
    });

}

function InitializeStatistics() {
    GetDataFromStorage();
    UpdateActiveTabData();
    SetListeners();
}

InitializeStatistics();
