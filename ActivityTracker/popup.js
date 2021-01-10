'use strict';
(function(){
let isStatDisplayed = false;
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

document.getElementById('Statistics').addEventListener('click', toggleStatistics);
// document.getElementById('Settings').addEventListener('click', toggleBadge);
})()
