(function(){
let isStatDisplayed = false;

function showStatistics() {
    chrome.runtime.sendMessage(null, "getStatistics", {}, (response) => {
        var table = document.getElementById('statisticsTable');
        var tbodyRef = table.getElementsByTagName('tbody')[0];
        var statisticsMap = JSON.parse(response);
        for(var key in statisticsMap) {
            var newRow = tbodyRef.insertRow();
            newRow.insertCell().appendChild(document.createTextNode(key));
            newRow.insertCell().appendChild(document.createTextNode(statisticsMap[key]));
        }
        table.style.display = "table";
    });
}
function hideStatistics() {
    var table = document.getElementById('statisticsTable');
    table.style.display = "none";
    var tbodyRef = table.getElementsByTagName('tbody')[0];
    var new_tbody = document.createElement('tbody');
    tbodyRef.parentNode.replaceChild(new_tbody, tbodyRef);
}

function showModal() {
    if(isStatDisplayed) {
        hideStatistics();
        showStatistics();
        return;
    }
    const modal = document.createElement("dialog");
    modal.setAttribute("style", 
    `display: flex;
    flex-direction: column;
    flex-wrap: wrap; 
    justify-content: space-evenly;
    position: fixed;
    top: 10%;
    border: none;
    border-radius: 20px;
    `);
    modal.innerHTML = 
    `
    <div>
    <div style="text-align: center;">
        <button style="font-size: 16px; border: none; border-radius: 15px; top: 10%;">x</button>
    </div>
    <div style="display: flex; flex-direction: column; overflow: auto;">
        <table id="statisticsTable" style="display: flex; flex-direction: column; border-color: black; max-height: 400px;" width="80%" cellpadding="1" cellspacing="0" border="2" border-color="black"">
            <thead>
                <th>Site</th>
                <th>Time(hh:mm:ss:mmm)</th>
            </thead>
            <div font-size="medium" font-style="normal" font-family="Segoe UI">
                <tbody>
                </tbody>
            </div>
        </table>
    </div>
    </div>
    `;
    document.body.appendChild(modal);
    let dialog = document.querySelector("dialog");
    dialog.showModal();
    hideStatistics();
    showStatistics();
    isStatDisplayed = true;
    dialog.querySelector("button").addEventListener("click", () => {
        console.log("MODAL close event");
        dialog.style.display = "none";
        dialog.close();
        dialog.parentNode.removeChild(dialog);
        isStatDisplayed = false;
    });
}

let lastFocuseState = true;
function checkPageFocus() {
    let message = "focus";
    let isDocumentFocused = document.hasFocus();
    if (!isDocumentFocused) {
        message = "blur";
    }
    if(isDocumentFocused != lastFocuseState) {
        chrome.runtime.sendMessage(null, {name: message, url: document.URL});
    }
    lastFocuseState = isDocumentFocused;
}

setInterval( checkPageFocus, 200 );

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.name == "showModal") {
            console.log("Show statistics!");
            showModal();
        }
        sendResponse();
    }
);
})()
