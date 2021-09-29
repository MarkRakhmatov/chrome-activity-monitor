(function() {
function getHostname(urlString) {
    try {
        return new URL(urlString).hostname;
    } catch(e) {
        console.log(`Failed to construct url from '${urlString}'. ${e.name}: ${e.message}`);
        return '';
    }
}
function getHostnameOrUrl(urlString) {
    let hostname = getHostname(urlString);
    if(!hostname) {
        console.log('Failed to get hostname - return full URL!');
        return urlString;
    }
    return hostname;
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
function getWeekDay() {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const d = new Date();
    return weekdays[d.getDay()];
}
function getCurrentTimeString() {
    let currentdate = new Date();
    return zeroPrefixedNum(currentdate.getHours(), 2) + ":"  
        + zeroPrefixedNum(currentdate.getMinutes(), 2);
}

function getActiveTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const activeTab = tabs[0];
            if (!activeTab) {
                reject();
                return;
            }
            resolve(activeTab);
        });
    });
}

class StorageWrapper {
    set(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({[key]: value}, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
    get(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([key], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
    }
    remove(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove([key], () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
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
    getActiveTimeMs() {
        return this.timer.getElapsedMilliseconds();
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
    toObject() {
        return {time: this.timer.getElapsedMilliseconds()};
    }
    fromObject(serialValue) {
        this.timer.fromMilliseconds(serialValue.time);
        this.tabIds.clear();
    }
}

class StatisticsHandler {
    constructor() {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
        this.lastActiveHostname = '';
        this.currentTab = 0;
        this.isDocumentFocused = true;
        this.isFullScreen = false;
        this.sitesIgnoreList = new Set([chrome.runtime.id, 'newtab', 'extensions']);
    }
    initFromSerialMap(serialMap) {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
        for (let key in serialMap) {
            let hostData = new HostTimeData();
            hostData.fromObject(serialMap[key]);
            this.hostnameToTimeData[key] = hostData;
        }
    }
    updateHostTimeData(hostname, tabId) {
        if (!hostname || hostname.length === 0) {
            return;
        }
        this.lastActiveHostname = hostname;
        if(!this.isDocumentFocused && !this.isFullScreen) {
            console.log('Document is not focused, skip update');
            return;
        }
        if(this.sitesIgnoreList.has(hostname)) {
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
    updateStatisticsFromTab(tab) {
        if (!tab.url || tab.url.length === 0) {
            return;
        }
        const { url, id } = tab;
        const hostname = getHostnameOrUrl(url);
        this.updateHostTimeData(hostname, id);
    }
    updateActiveTabData() {
        getActiveTab().then(this.updateStatisticsFromTab.bind(this), this.deactivateCurrentHost.bind(this));
    }
    deactivateTab(tabId) {
        if(this.isFullScreen) {
            return;
        }
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
        if(this.isFullScreen) {
            return;
        }
        console.log('Deactivate statistics timer for hostname: ' + hostname);
        let hostTimeData = this.hostnameToTimeData[hostname];
        if (hostTimeData) {
            hostTimeData.deactivate();
        }
    }
    deactivateCurrentHost() {
        this.deactivateHost(this.lastHostname);
    }
    handleFocusChange(focusState, hostname, tabId) {
        if(focusState) {
            this.currentTab = tabId;
            this.isDocumentFocused = true;
            this.updateHostTimeData(hostname, tabId);
        }
        else if(tabId != this.currentTab) {
            console.log("Skip focus deactivating - tab is not active!");
        }
        else {
            this.isDocumentFocused = false;
            this.deactivateCurrentHost();
        }
    }
    handleFullscreenChange(fullscreenState, hostname, tabId) {
        if(fullscreenState) {
            this.currentTab = tabId;
            this.isFullScreen = true;
            this.updateHostTimeData(hostname, tabId);
        }
        else {
            this.isFullScreen = false;
        }
    }
    getLastHostname() {
        return this.lastHostname;
    }
    getLastActiveHostname() {
        return this.lastActiveHostname;
    }
    getActiveTimeForHostname(hostname) {
        let hostData = this.hostnameToTimeData[hostname] ;
        if(!hostData) {
            return 0;
        }
        return hostData.getActiveTimeMs();
    }
    getFormattedMap()
    {
        let hostToTimestamp = {};
        const sortedDataMap = this.getSortedDataMap();
        for (let [key, value] of sortedDataMap) {
            hostToTimestamp[key] = value.getActiveTimeDuration().toString();
        }
        return JSON.stringify(hostToTimestamp);
    }
    getMapForSerialization() {
        let hostnameToJson = {};
        for (let key in this.hostnameToTimeData) {
            hostnameToJson[key] = this.hostnameToTimeData[key].toObject();
        }
        return hostnameToJson;
    }
    getSortedDataMap() {
        return Object.entries(this.hostnameToTimeData).sort((a, b) => b[1].timer.getElapsedMilliseconds() - a[1].timer.getElapsedMilliseconds());
    }
    reset() {
        this.hostnameToTimeData = {};
        this.lastHostname = '';
        this.currentTab = 0;
    }
}

class CommunicationHandler {
    constructor(statisticsHandlerRef) {
        this.statisticsHandler = statisticsHandlerRef;
        this.messageHandlers = {
            "focusState" : this.onFocusStateMsg.bind(this),
            "fullscreenState" : this.onFullscreenStateMsg.bind(this),
            "getStatistics": this.onGetStatisticsMsg.bind(this)};
        chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
    }
    onFocusStateMsg(message, sender, _response) {
        let url = getHostnameOrUrl(message.url);
        console.log((message.focus === true? 'focus ' : 'blur ') + url);
        this.statisticsHandler.handleFocusChange(message.focus, url, sender.tab.id);
    }
    onFullscreenStateMsg(message, sender, _response) {
        let url = getHostnameOrUrl(message.url);
        console.log('Fullscreen ' + (message.fullscreen === true? 'on ' : 'off ') + url);
        this.statisticsHandler.handleFullscreenChange(message.fullscreen, url, sender.tab.id);
    }
    onGetStatisticsMsg(message, sender, response) {
        response(this.statisticsHandler.getFormattedMap());
    }
    onMessage(message, sender, response) {
        if(!message.name) {
            return;
        }
        this.messageHandlers[message.name](message, sender, response);
    }
    showModal() {
        let showStatisticTableOnActiveTab = (activeTab)=> {
            let formattedStat = this.statisticsHandler.getFormattedMap();
            if(formattedStat === "{}")
            {
                console.warn('Stat object is empty!');
                return;
            }
            chrome.tabs.sendMessage(activeTab.id, {name : "showModal", stat : formattedStat}, {}, (_response)=>{
                if (chrome.runtime.lastError) {
                    console.log("Failed to show statistics: " + chrome.runtime.lastError.message);
                }
            });
        };
        let logIfNoActiveTab = ()=> {
            console.log('No active tab!');
        };
        getActiveTab().then( 
            showStatisticTableOnActiveTab,
            logIfNoActiveTab);
    }
    showAccessBlockingMessage(message) {
        let sendMessage = (activeTab)=> {
            if(!message.includes(getHostnameOrUrl(activeTab.url))) {
                return;
            }
            chrome.tabs.sendMessage(activeTab.id, {name : "showAccessBlockingMessage", message: message}, {}, (_response)=>{
                if (chrome.runtime.lastError) {
                    console.log("Failed to showAccessBlockingMessage: " + chrome.runtime.lastError.message);
                }
            });
        };
        let logIfNoActiveTab = ()=> {
            console.log('No active tab!');
        };
        getActiveTab().then( 
            sendMessage,
            logIfNoActiveTab);
    }
    showAccessBlockingAlert(message) {
        this.showAccessBlockingMessage(`Access to ${message.hostname} blocked! Reason: ${message.reason}`);
    }
}

class AlertManager {
    constructor() {
        this.alertInfos = [];
        this.activeAlerts = [];
        this.dayOfWeek = getWeekDay();
        setInterval(this.checkAlert.bind(this), 1000);
    }
    showAlert(message) {
        alert(message);
    }
    checkAlert() {
        let currentDayOfWeek = getWeekDay();
        if(this.dayOfWeek != currentDayOfWeek) {
            this.dayOfWeek = currentDayOfWeek;
            this.updateCurrentDayAlerts();
        }
        let len = this.activeAlerts.length;
        if(!len) {
            return;
        }
        let nextAlertIndex = len - 1; 
        let currentTimeofDay = getCurrentTimeString();
        if(this.activeAlerts[nextAlertIndex].time <= currentTimeofDay) {
            this.showAlert(this.activeAlerts[nextAlertIndex].message);
            this.activeAlerts.pop();
        }
    }
    updateCurrentDayAlerts() {
        let currentTimeofDay = getCurrentTimeString();
        let activeAlerts = this.alertInfos.filter((value) => 
            (value.days.includes('Every day') || value.days.includes(this.dayOfWeek)) && value.time > currentTimeofDay)
                activeAlerts = activeAlerts.sort((a, b) =>  a.time > b.time  ? -1 : a.time === b.time? 0 : 1);
        this.activeAlerts = activeAlerts;
    }
    updateAlertInfos(alertsInfos) {
        this.alertInfos = alertsInfos;
        this.dayOfWeek = getWeekDay();
        this.updateCurrentDayAlerts();
    }
}

function updateTableRows(tableName, tableData)
{
    let tableRows = tableData[tableName];
    if(!tableRows) {
        return;
    }
    let newValue = tableRows['newValue'];
    if(newValue) {
        return newValue;
    }
    return tableRows;
}
class SettingsPeriodTable {
    constructor(name) {
        this.name = name;
        this.rows;
        this.alertManager = new AlertManager(); 
    }
    includes(site) {
        if(!this.rows) {
            return {inList: false, isActiveRowsEmpty: true};
        }

        let rows = this.getActiveRows(site);
        if(!rows.length) {
            return {inList: false, isActiveRowsEmpty: true};
        }
        for(let row of rows) {
            if(row.site.split(/\s|\n|\r/).includes(site)) {
                return {inList: true, isActiveRowsEmpty: false};
            }
        }
        return {inList: false, isActiveRowsEmpty: false};
    }
    getActiveRows() {
        let rows = [];
        let currentTimeofDay = getCurrentTimeString();
        let currentDayOfWeek = getWeekDay();
        for(let [i, row] of Object.entries(this.rows)) {
            if(row.days.includes('Every day') || row.days.includes(currentDayOfWeek)) {
                let inList = currentTimeofDay >= row.timeStart && currentTimeofDay < row.timeEnd;
                if(inList) {
                    rows.push(row);
                }
            }
        }
        return rows;
    }
    update(tableData) {
        let newRows = updateTableRows(this.name,tableData);
        if(newRows) {
            this.rows = newRows;
            let alertInfosConverter = (rows) => {
                let alertInfos = [];
                for(let [i, row] of Object.entries(rows)) {
                    alertInfos.push({time: row.timeStart, days: row.days, message: this.name + ': ' + row.site});
                }
                return alertInfos;
            };
            this.alertManager.updateAlertInfos(alertInfosConverter(newRows));
        }
    }
}

class SettingsIntervalTable {
    constructor(name) {
        this.name = name;
        this.rows;
    }
    includes(siteToCheck) {
        if(!this.rows) {
            return false;
        }
        let currentDayOfWeek = getWeekDay();
        
        for(let [i, row] of Object.entries(this.rows)) {
            if(row.days.includes('Every day') || row.days.includes(currentDayOfWeek)) {
                let sites = row.site.split(/\s|\n|\r/);
                if(sites.includes(siteToCheck)) {
                    let timeOnLimitedAccesSites = 0;
                    for(let site of sites) {
                        let activeTime = window.eventHandler.statisticsHandler.getActiveTimeForHostname(site)
                        timeOnLimitedAccesSites += activeTime;
                    };
                    let activeTimeStr = new Duration(timeOnLimitedAccesSites).toString();
                    let rowTime = row.timeInterval + ":00";
                    return  activeTimeStr > rowTime;
                }
            }
        }
        return false;
    }
    update(tableData) {
        let newRows = updateTableRows(this.name,tableData);
        if(newRows) {
            this.rows = newRows;
        }
    }
}

class AccessController {
    constructor(onAccessBlockedCallback) {
        this.blackList = new SettingsPeriodTable('Black List');
        this.whiteList = new SettingsPeriodTable('White List');
        this.limitedAccessList = new SettingsIntervalTable('Limited Access List');
        this.onAccessBlocked = onAccessBlockedCallback;
        chrome.webRequest.onBeforeRequest.addListener(
            this.onBeforeRequest.bind(this),
            {urls: ["*://*/*"]},
            ['blocking']);
    }
    isAccessBlocked(hostname) {
        if(hostname !== window.eventHandler.statisticsHandler.getLastActiveHostname()) {
            return false;
        }
        let result = this.whiteList.includes(hostname);
        if(!result.isActiveRowsEmpty) {
            if(result.inList) {
                return false;
            }
            else {
                this.onAccessBlocked({
                    hostname: hostname,
                    reason: `${hostname} does not belong to the list of allowed sites!`
                });
                return true;
            }
        }
        if(this.blackList.includes(hostname).inList) {
            this.onAccessBlocked({
                hostname: hostname,
                reason: `${hostname} belong to the list of blocked sites!`
            })
            return true;
        }
        if(this.limitedAccessList.includes(hostname)) {
            this.onAccessBlocked({
                hostname: hostname,
                reason: `${hostname} time limit exceeded!`
            });
            return true;
        }
        return false;
    }
    onBeforeRequest(details) {
        let initiatorHostname = getHostname(details.initiator);
        let urlHostname = getHostname(details.url);
        let isBlocked = this.isAccessBlocked(initiatorHostname) || this.isAccessBlocked(urlHostname);
        return {cancel: isBlocked};
    }
    updateLists(tableData) {
        this.blackList.update(tableData);
        this.whiteList.update(tableData);
        this.limitedAccessList.update(tableData);
    }
}

class SettingsHandler {
    constructor(onSettingsUpdateCallback) {
        this.onSettingsUpdate = onSettingsUpdateCallback;
        this.storageKeys = {
            whiteList: 'White List',
            blackList: 'Black List',
            limitedAccessList: 'Limited Access List'};
        this.storage = new StorageWrapper();
        this.onFail = (error) => {
            console.warn('Failed to get settings: ' + error.message);
        };
        chrome.storage.onChanged.addListener(this.onStorageChange.bind(this));
        this.init();  
    }
    init() {
        let onSuccess = (result) => {
            if(Object.entries(result).length) {
                this.onSettingsUpdate(result);
            }
        };
        this.storage.get(this.storageKeys.whiteList).then(onSuccess, this.onFail);
        this.storage.get(this.storageKeys.blackList).then(onSuccess, this.onFail);
        this.storage.get(this.storageKeys.limitedAccessList).then(onSuccess, this.onFail);
    }
    onStorageChange(changes, areaName) {
        if(areaName !== 'local') {
            return;
        }
        this.onSettingsUpdate(changes);
    }
}

class EventHandler {
    constructor() {
        this.storageKeys = {statistics: 'stat', day: 'day'};
        this.storage = new StorageWrapper();
        this.InitStatistics();
        this.communicationHandler = new CommunicationHandler(this.statisticsHandler);
        this.accessController = new AccessController(this.communicationHandler.showAccessBlockingAlert.bind(this.communicationHandler));
        let onSettingsUpdate = (changes) => {
            this.accessController.updateLists(changes);
        };
        this.settings = new SettingsHandler(onSettingsUpdate);
        this.setListeners();
    }
    InitStatistics() {
        this.statisticsHandler = new StatisticsHandler();
        this.storage.get(this.storageKeys.statistics).then((result) => {
            if (!result.stat) {
                return;
            }
            if (result.stat) {
                this.statisticsHandler.initFromSerialMap(result.stat);
            }
        },
        (error)=>{
            console.warn("Failed to get statistics from storage " + error.message);
        });
    }
    onTabUpdate(_tabId, _changeInfo, tab) {
        console.log('onUpdated');
        this.statisticsHandler.updateStatisticsFromTab(tab);
    }
    onTabActivated(activeInfo) {
        console.log('onActivated');
        let checkActiveTab = (tab) => {
            this.statisticsHandler.updateStatisticsFromTab(tab);
        };
        chrome.tabs.get(activeInfo.tabId, checkActiveTab);
        this.storage.set(this.storageKeys.statistics, this.statisticsHandler.getMapForSerialization());
    }
    onTabRemoved(tabId, _removeInfo) {
        console.log('onRemoved ' + tabId);
        this.statisticsHandler.deactivateTab(tabId);
        this.storage.set(this.storageKeys.statistics, this.statisticsHandler.getMapForSerialization());
    }
    onDayChanged() {
        this.statisticsHandler.updateActiveTabData();
        this.communicationHandler.showModal();
        this.storage.remove(this.storageKeys.statistics).then(()  => {
            console.log("Removed stat from local storage");
            this.statisticsHandler.reset();
            this.statisticsHandler.updateActiveTabData();
        },
        (error)=>{
            console.warn("Failed to remove stat from storage " + error.message);
        });
    }
    checkDayChange() {
        let onSuccess = (result) => {
            const lastDay = result.day;
            const currentDay = getWeekDay();
            if (lastDay !== currentDay) {
                this.onDayChanged();
            }
            this.storage.set(this.storageKeys.day, getWeekDay()).then(null,
                ()=>{console.warn('Failed to set data to storage.');}, 
                (error)=>{
                    console.warn("Failed to get statistics from storage " + error.message);
                });
        };
        let onFail = (error) => {
            console.warn("Failed to get day from storage " + error.message);
        };
        this.storage.get(this.storageKeys.day).then(onSuccess, onFail);
        this.statisticsHandler.updateActiveTabData();
    }
    setListeners() {
        chrome.tabs.onUpdated.addListener(this.onTabUpdate.bind(this));
        chrome.tabs.onActivated.addListener(this.onTabActivated.bind(this));
        chrome.tabs.onRemoved.addListener(this.onTabRemoved.bind(this));
        setInterval(() => {
            this.checkDayChange();
        }, 5000);
    }
}

window.eventHandler = new EventHandler(); 

})()
