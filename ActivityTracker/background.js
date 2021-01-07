
function GetUrlHostname(url)
{
	var hostname;
	//find & remove protocol (http, ftp, etc.) and get hostname

	if (url.indexOf("//") > -1) {
		hostname = url.split('/')[2];
	}
	else {
		hostname = url.split('/')[0];
	}
	return hostname;
}

function GetWeekDay()
{
	const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var d = new Date();
	return weekdays[d.getDay()];
}
function ZeroPrefixedNum(num, width)
{
	var numStr = num.toString();
	var numSize = numStr.length;
	var prefix = '';
	prefixSize =  width - numSize;
	while(prefixSize--)
	{
		prefix += 0;
	}
	return prefix + numStr;
}
class Duration
{
	constructor(milliseconds)
	{
		const msInSeconds = 1000;
		const msInMinutes = 60*msInSeconds;
		const msInHours = 60*msInMinutes;

		this.hours = Math.floor(milliseconds / msInHours);
		milliseconds -= this.hours * msInHours;
		this.minutes = Math.floor(milliseconds / msInMinutes);		
		milliseconds -= this.minutes * msInMinutes;
		this.seconds = Math.floor(milliseconds / msInSeconds);
		milliseconds -= this.seconds * msInSeconds;
		this.milliseconds = Math.floor(milliseconds);
	}
	ToString()
	{
		return '' + ZeroPrefixedNum(this.hours, 2) + 
				':' + ZeroPrefixedNum(this.minutes, 2) + 
				':' + ZeroPrefixedNum(this.seconds, 2) + 
				':' + ZeroPrefixedNum(this.milliseconds, 3);
	}
}
class Timer
{
	constructor()
	{
		this.Reset();
	}
	Reset()
	{
		this.activeTimeDuration = 0;
		this.isActive = false;
		this.lastTimePoint = 0;
	}
	Start()
	{
		if(this.isActive)
		{
			return;
		}
		this.isActive = true;
		this.lastTimePoint = Date.now();
	}
	Pause()
	{
		if(!this.isActive)
		{
			return;
		}
		this.UpdateElapsedTimeDuration();
		this.isActive = false;
	}

	Stop()
	{
		this.activeTimeDuration = 0;
		this.isActive = false;
	}
	UpdateElapsedTimeDuration()
	{
		if(!this.isActive)
		{
			return;
		}
		var timeNow = Date.now();
		this.activeTimeDuration += timeNow - this.lastTimePoint;
		this.lastTimePoint = timeNow;
	}
	GetElapsedTimeDuration()
	{
		this.UpdateElapsedTimeDuration();
		return new Duration(this.activeTimeDuration);
	}
	FromMiliseconds(miliseconds)
	{
		this.activeTimeDuration = miliseconds;
		this.lastTimePoint = 0;
		this.isActive = false;
	}
	GetElapsedMilliseconds()
	{
		this.UpdateElapsedTimeDuration();
		return this.activeTimeDuration;
	}
}
// contains info about url hostname, opened tabs and 
class HostTimeData
{
	constructor(tabId)
	{
		this.timer = new Timer();
		this.timer.Start();
		this.tabIds = new Array();
		this.AddTab(tabId);
	}
	Activate()
	{
		this.timer.Start();
	}
	Deactivate()
	{
		this.timer.Pause();
		var timeDuration = this.GetActiveTimeDuration();
		console.log('ActiveTimeDuration: %s', timeDuration.ToString());
	}
	GetActiveTimeDuration()
	{
		return this.timer.GetElapsedTimeDuration();
	}
	AddTab(tabId)
	{
		if(this.tabIds.includes(tabId))
		{
			return;
		}
		this.tabIds.push(tabId);
	}
	RemoveTab(tabId)
	{
		this.tabIds = this.tabIds.filter(function(item)
		{
			return item !== tabId;
		});
	}
	Reset()
	{
		this.timer.Reset();
		this.timer.Start();
		this.tabIds.clear();
	}
	ToJson()
	{
		return JSON.stringify({time: this.timer.GetElapsedMilliseconds()});
	}
	FromJson(serialValue)
	{
		var deserialized = JSON.parse(serialValue);
		this.timer.FromMiliseconds(deserialized.time);
	}
}

class StatisticsHandler
{
	constructor()
	{
		this.hostnameToTimeData = new Map();
		this.lastHostname = '';
	}
	UpdateHostTimeData(hostname, tabId)
	{
		if(this.lastHostname.length !== 0 && hostname !== this.lastHostname)
		{
			this.hostnameToTimeData.get(this.lastHostname).Deactivate();
		}
		var hostTimeData = this.hostnameToTimeData.get(hostname);
		if(hostTimeData == undefined)
		{
			this.hostnameToTimeData.set(hostname, new HostTimeData(tabId));
			hostTimeData = this.hostnameToTimeData.get(hostname);
		}
		hostTimeData.Activate();
		hostTimeData.AddTab(tabId);
		this.lastHostname = hostname;
		console.log('Map size: ' + this.hostnameToTimeData.size);
	}
	Deactivate(tabId)
	{
		console.log('Deactivate statistics timer for tabId: ' + tabId);
		for (var [key, value] of this.hostnameToTimeData)
		{
			console.log('Opened tabs: ' + value.tabIds);
			if(value.tabIds.includes(tabId))
			{
				console.log('User closed tab with hostname: ' + key);
				value.Deactivate();
				value.RemoveTab(tabId);
			}
		}
	}
	DeactivateHost(hostname)
	{
		console.log('Deactivate statistics timer for hostname: ' + hostname);
		var hostTimeData = this.hostnameToTimeData.get(hostname);
		if(hostTimeData)
		{
			hostTimeData.Deactivate();
		}
	}
	GetMapForSerialization()
	{
		var hostnameToJson = new Map();
		for(var [key, value] of this.hostnameToTimeData)
		{
			hostnameToJson.set(key, value.ToJson());
		}
		return JSON.stringify(Array.from(hostnameToJson.entries()));
	}
	InitFromSerialMap(serialMap)
	{
		this.hostnameToTimeData.clear();
		this.lastHostname = '';
		for(var [key, value] of serialMap)
		{
			var hostData = new HostTimeData();
			hostData.FromJson(value);
			this.hostnameToTimeData.set(key, hostData);
		}
	}
	Reset()
	{
		this.hostnameToTimeData.clear();
		this.lastHostname = '';
	}
}

var gStatisticsHandler = new StatisticsHandler();

function UpdateStatisticsFromTab(tab)
{
	if(tab.url == undefined || tab.url.length == 0)
	{
		return;
	}
	var	url = tab.url;
	var hostname = GetUrlHostname(url);
	console.log('onUpdated url: ' + tab.url);
	console.log('onUpdated hostname: ' + hostname);
	gStatisticsHandler.UpdateHostTimeData(hostname, tab.id);
}

function UpdateActiveTabData()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
			{
				var currTab = tabs[0];
				if (!currTab)
				{
					console.log('No active tab!');
					return;
				}
				UpdateStatisticsFromTab(currTab);
			});
}

function SetDataToStorage(updatedDataMap)
{
	chrome.storage.local.set({stat: updatedDataMap});
}

function GetDataFromStorage()
{
	chrome.storage.local.get('stat', function(result)
	{
		if(!result.stat)
		{
			return;
		}
		
		var serializedMap = new Map(Array.from(JSON.parse(result.stat)));
		if(serializedMap)
		{
			gStatisticsHandler.InitFromSerialMap(serializedMap);
		}
	});
}

function SetListeners()
{
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
	{
		if(changeInfo.discarded !== undefined)
		{
			console.log('onUpdated discarded: ' + changeInfo.discarded);
		}
		UpdateStatisticsFromTab(tab);
	});

	chrome.tabs.onActivated.addListener(function(activeInfo)
	{
		console.log('onActivated');
		chrome.tabs.get(activeInfo.tabId ,UpdateStatisticsFromTab);
	});

	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo)
	{
		console.log('onRemoved ' + tabId);
		gStatisticsHandler.Deactivate(tabId);
		SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
	});
	chrome.windows.onFocusChanged.addListener(function(number)
	{
		SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
		if(number == chrome.windows.WINDOW_ID_NONE)
		{
			console.log('No active window - will deactivate last hostname');
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
			{
				var currTab = tabs[0];
				if (!currTab)
				{
					console.log('No active tab!');
					gStatisticsHandler.DeactivateHost(gStatisticsHandler.lastHostname);
					return;
				}
				UpdateStatisticsFromTab(currTab);
			});
		}
		else
		{
			UpdateActiveTabData();
		}
	});
	
	chrome.runtime.onSuspend.addListener(function()
	{
		UpdateActiveTabData();
		SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
	});
  
	var alarmCreateInfo =
	{
		'delayInMinutes': 1,
		'periodInMinutes' : 2
	};
	var activeTabUpdater = 'ActiveTabUpdater';
	chrome.alarms.create(activeTabUpdater, alarmCreateInfo);
	
	var serializerAlarmCreateInfo =
	{
		'delayInMinutes': 1,
		'periodInMinutes' : 2
	};
	var statisticsSerializer = 'StatisticsSerializer';
	chrome.alarms.create(statisticsSerializer, serializerAlarmCreateInfo);
	
	chrome.alarms.onAlarm.addListener(function(alarm)
	{
		console.log('Alarm fired: ' + alarm.name);
		if(alarm.name == activeTabUpdater)
		{
			UpdateActiveTabData();
		}
		if(alarm.name == statisticsSerializer)
		{
			SetDataToStorage(gStatisticsHandler.GetMapForSerialization());
			CheckDayChange();
		}
	});
	
	chrome.runtime.onMessage.addListener((message, sender, response) => 
	{
		if(message == "getStatistics")
		{
			var hostToTimestamp = new Map();
			var sortedDataMap = [...gStatisticsHandler.hostnameToTimeData.entries()].sort((a, b) => b[1].timer.GetElapsedMilliseconds() - a[1].timer.GetElapsedMilliseconds())
			for(var [key, value] of sortedDataMap)
			{
				hostToTimestamp.set(key, value.GetActiveTimeDuration().ToString());
			}
			response(JSON.stringify(Array.from(hostToTimestamp)));
		}
	});
}

function OnDayChanged()
{
	chrome.storage.local.remove('stat',() => 
	{
		if(chrome.runtime.lastError)
		{
			console.warn("Failed to remove stat from storage " + chrome.runtime.lastError.message);
		}
		else
		{
			SetDataToStorage('');
			console.log("Removed stat from local storage");
			gStatisticsHandler.Reset();
		}
	});
}

function CheckDayChange()
{
	chrome.storage.local.get('day', function(result)
	{
		if(result.day)
		{
			var lastDay = result.day;
			var currentDay = GetWeekDay();
			if(lastDay !== currentDay)
			{
				OnDayChanged();
			}
		}
		chrome.storage.local.set({day: GetWeekDay()});
	});
	
}

function InitializeStatistics()
{
	GetDataFromStorage();
	UpdateActiveTabData();
	SetListeners();
}

InitializeStatistics();
