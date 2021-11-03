'use strict';
(function(){
let isStatDisplayed = false;
let isTemporaryDisabled = false;

function InitCheckboxDisabled() {
    chrome.runtime.sendMessage(null, {name: "isDisabled"}, {}, (response) => {
        console.log(response.isDisabled);
        document.getElementById('temporaryDisable').checked= !response.isDisabled;
    });
}
InitCheckboxDisabled();

function showStatistics() {
    chrome.runtime.sendMessage(null, {name: "getStatistics"}, {}, (response) =>
    {
        let table = document.getElementById('statisticsTable');
        let tbodyRef = table.getElementsByTagName('tbody')[0];
        let statisticsMap = JSON.parse(response);
        for(let key in statisticsMap)
        {
            let newRow = tbodyRef.insertRow();
            newRow.insertCell().appendChild(document.createTextNode(key));
            newRow.insertCell().appendChild(document.createTextNode(statisticsMap[key]));
        }
        table.style.display = "table";
    });
}

function hideStatistics() {
    let table = document.getElementById('statisticsTable');
    table.style.display = "none";
    let tbodyRef = table.getElementsByTagName('tbody')[0];
    let new_tbody = document.createElement('tbody');
    tbodyRef.parentNode.replaceChild(new_tbody, tbodyRef);
}


function toggleStatistics() {
    let statButton = document.getElementById('Statistics');
    if(isStatDisplayed) {
        hideStatistics();
        statButton.innerText = 'Show statistics';
    }
    else {
        showStatistics();
        statButton.innerText = 'Hide statistics';
    }
    isStatDisplayed = !isStatDisplayed;
}

function openOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

function temporaryDisable() {
    isTemporaryDisabled = !isTemporaryDisabled;
    chrome.runtime.sendMessage(null, {name: "temporaryDisable", isTemporaryDisabled: isTemporaryDisabled}, {}, (response) =>
    {
        if(isTemporaryDisabled) {
            setTimeout(()=>{
                checkboxElement.setAttribute("checked", false);
            }, response.timeout);
        }
    });
}

document.getElementById('Statistics').addEventListener('click', toggleStatistics);
document.getElementById('Settings').addEventListener('click', openOptions);
document.getElementById('temporaryDisable').addEventListener('click', temporaryDisable);
})()
