(function() {
function getHostname(urlString) {
    return new URL(urlString).hostname;
}
function getHostnameOrUrl(urlString) {
    let hostname = getHostname(urlString);
    if(!hostname) {
        console.log('Failed to get hostname - return full URL!');
        return urlString;
    }
    return hostname;
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
            ':' + zeroPrefixedNum(this.seconds, 2);
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

    fromMilliseconds(milliseconds) {
        this.activeTimeDuration = milliseconds;
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
        this.timer.fromMilliseconds(deserialized.time);
        this.tabIds.clear();
    }
}

class StatisticsHandler {
    constructor() {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
        this.currentTab = 0;
        this.isDocumentFocused = true;
    }

    updateHostTimeData(hostname, tabId) {
        if(!this.isDocumentFocused) {
            console.log('Document is not focused, skip update');
            return;
        }
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
        this.currentTab = tabId;
        this.lastHostname = hostname;
    }

    deactivate(tabId) {
        console.log('Deactivate statistics timer for tabId: ' + tabId);
        for (let host in this.hostnameToTimeData) {
            const value = this.hostnameToTimeData[host];
            if (value.tabIds.has(tabId)) {
                console.log('User closed tab with hostname: ' + host);
                console.log('Opened tabs: ' + Array.from(this.hostnameToTimeData[host].tabIds));
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
    deactivateCurrentHost() {
        this.deactivateHost(this.lastHostname);
    }
    setFocusState(focusState, tabId) {
        if(focusState) {
            this.currentTab = tabId;
            this.isDocumentFocused = true;
        }
        else if(tabId != this.currentTab) {
            console.log("Skip focus deactivating - tab is not active!");
        }
        else {
            this.isDocumentFocused = false;
        }
    }
    getLastHostname() {
        return this.lastHostname;
    }
    getFormattedMap()
    {
        let hostToTimestamp = {};
        const sortedDataMap = window.statisticsHandler.getSortedDataMap();
        for (let [key, value] of sortedDataMap) {
            hostToTimestamp[key] = value.getActiveTimeDuration().toString();
        }
        return JSON.stringify(hostToTimestamp);
    }
    getMapForSerialization() {
        let hostnameToJson = {};
        for (let key in this.hostnameToTimeData) {
            hostnameToJson[key] = this.hostnameToTimeData[key].toJson();
        }
        return JSON.stringify(hostnameToJson);
    }
    
    getSortedDataMap() {
        return Object.entries(this.hostnameToTimeData).sort((a, b) => b[1].timer.getElapsedMilliseconds() - a[1].timer.getElapsedMilliseconds());
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

window.statisticsHandler = new StatisticsHandler();

function updateStatisticsFromTab(tab) {
    if (!tab.url || tab.url.length === 0) {
        return;
    }
    const { url, id } = tab;
    const hostname = getHostnameOrUrl(url);

    if(chrome.runtime.id === hostname) {
        console.log('Skip handling of events from our extension!');
        return;
    }
    window.statisticsHandler.updateHostTimeData(hostname, id);
}
function operationOnActiveTab(onActiveTab, onNoActiveTab) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const activeTab = tabs[0];
        if (!activeTab) {
            onNoActiveTab();
            return;
        }
        onActiveTab(activeTab);
    });
}
function updateActiveTabData() {
    operationOnActiveTab(
        updateStatisticsFromTab,
        ()=>{
            console.log('No active tab!');
            window.statisticsHandler.deactivateCurrentHost();
        }
    );
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
            window.statisticsHandler.initFromSerialMap(serializedMap);
        }
    });
}

function showModal()
{
    operationOnActiveTab( 
        (activeTab)=> {
            chrome.tabs.sendMessage(activeTab.id, {name : "showModal", stat : window.statisticsHandler.getFormattedMap()}, {}, (_response)=>{
                if (chrome.runtime.lastError) {
                    console.warn("Failed to show statistics: " + chrome.runtime.lastError.message);
                }
            })
        },
        ()=> {
            console.log('No active tab!');
        });
}

function onDayChanged() {
    showModal();
    
    chrome.storage.local.remove('stat', () => {
        if (chrome.runtime.lastError) {
            console.warn("Failed to remove stat from storage " + chrome.runtime.lastError.message);
        } else {
            console.log("Removed stat from local storage");
            window.statisticsHandler.reset();
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

function setListeners() {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        console.log('onUpdated');
        updateStatisticsFromTab(tab);
    });

    chrome.tabs.onActivated.addListener(function (activeInfo) {
        console.log('onActivated');
        chrome.tabs.get(activeInfo.tabId, updateStatisticsFromTab);
    });

    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        console.log('onRemoved ' + tabId);
        window.statisticsHandler.deactivate(tabId);
        setDataToStorage(window.statisticsHandler.getMapForSerialization());
    });

    chrome.runtime.onMessage.addListener((message, sender, response) => {
        if(!message.name) {
            return;
        }
        if(message.name === "blur") {
            let url = getHostnameOrUrl(message.url);
            console.log('blur ' + url);
            window.statisticsHandler.deactivateCurrentHost();
            window.statisticsHandler.setFocusState(false, sender.tab.id);
        }
        else if(message.name === "focus") {  
            let url = getHostnameOrUrl(message.url);    
            console.log('focus ' + url);
            window.statisticsHandler.setFocusState(true, sender.tab.id);
            updateActiveTabData();
        }
        else if (message.name === "getStatistics") {
            response(window.statisticsHandler.getFormattedMap());
        }
    });
}

function initializeStatistics() {
    getDataFromStorage();
    updateActiveTabData();
    setListeners();
    setInterval(()=>{
        updateActiveTabData();
        setDataToStorage(window.statisticsHandler.getMapForSerialization());
        checkDayChange();
    }, 20000);
    
    setInterval(showModal, 3600*1000);
}

initializeStatistics();
})()
