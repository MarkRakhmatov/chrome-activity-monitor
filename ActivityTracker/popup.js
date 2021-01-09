'use strict';

function ShowStatistics() {
    chrome.runtime.sendMessage(null, "getStatistics", {}, (response) => {
        var table = document.getElementById('statisticsTable');
        var tbodyRef = table.getElementsByTagName('tbody')[0];
        var statisticsMap = JSON.parse(response);
        for (var key in statisticsMap) {
            var newRow = tbodyRef.insertRow();
            newRow.insertCell().appendChild(document.createTextNode(key));
            newRow.insertCell().appendChild(document.createTextNode(statisticsMap[key]));
        }
        table.style.display = "table";
    });
}

function HideStatistics() {
    var table = document.getElementById('statisticsTable');
    table.style.display = "none";
    var tbodyRef = table.getElementsByTagName('tbody')[0];
    var new_tbody = document.createElement('tbody');
    tbodyRef.parentNode.replaceChild(new_tbody, tbodyRef);
}


function ToggleStatistics(event) {
    var statButton = document.getElementById('Statistics');
    if (statButton.innerText == "Show statistics") {
        ShowStatistics();
        statButton.innerText = 'Hide statistics';
    } else {
        HideStatistics();
        statButton.innerText = 'Show statistics';
    }
}

function openOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

//An Alarm delay of less than the minimum 1 minute will fire
// in approximately 1 minute incriments if released
document.getElementById('Statistics').addEventListener('click', ToggleStatistics);
document.getElementById('Settings').addEventListener('click', openOptions);

