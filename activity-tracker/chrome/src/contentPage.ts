(function () {
    let isStatDisplayed = false;

    function showStatistics(stat) {
        var table = document.getElementById('statisticsTable');
        var tbodyRef = table.getElementsByTagName('tbody')[0];
        var statisticsMap = JSON.parse(stat);
        for (var key in statisticsMap) {
            var newRow = tbodyRef.insertRow();
            newRow.insertCell().appendChild(document.createTextNode(key));
            newRow.insertCell().appendChild(document.createTextNode(statisticsMap[key]));
        }
        table.style.display = "table";
    }

    function hideStatistics() {
        var table = document.getElementById('statisticsTable');
        table.style.display = "none";
        var tbodyRef = table.getElementsByTagName('tbody')[0];
        var new_tbody = document.createElement('tbody');
        tbodyRef.parentNode.replaceChild(new_tbody, tbodyRef);
    }

    function showModal(stat) {
        if (isStatDisplayed) {
            hideStatistics();
            showStatistics(stat);
            return;
        }
        const modal = document.createElement("dialog");
        modal.setAttribute("style",
            `
    display: flex;
    flex-direction: column;
    justify-content:space-evenly;
    position: fixed;
    top: 25%;
    border: none;
    background-color:#fdfcf9;
    border-radius: 20px;
    padding-bottom: 15px;
    padding-left: 15px;
    padding-right: 15px;
    margin:0 auto;
    min-width: 260px;
    `);
        modal.setAttribute("id", "StatisticsModalWindow");
        modal.innerHTML =
            `
    <div>
    <div style="
            display: flex;
            flex-wrap: wrap;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: none;">
        <style>
            #statisticsButtonContainer {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 2%;
            }
            #statisticsButtonContainer button:hover {
                background: #E81123;
                color: white;
                box-shadow: 0 8px 10px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
            }
            #statisticsButtonContainer button:focus {
                outline: none;
            }
            #statisticsButton {
                font-size: 14px;
                width: 35px;
                height: 35px;
                border: none;
                border-radius: 15px;
                text-align: center;
                transition-duration: 0.4s;
            }
            #statisticsTable {
                font-family: Arial, Helvetica, sans-serif;
                border-collapse: collapse;
                width: 100%;
            }
            #statisticsTable td,
            #statisticsTable th {
                border: 1px solid #ddd;
                padding: 8px;
            }
            #statisticsTable tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            #statisticsTable tr:hover {
                background-color: #ddd;
            }
            #statisticsTable th {
                padding-top: 12px;
                padding-bottom: 12px;
                text-align: center;
                background-color: #3367D6;
                color: white;
            }
        </style>
        <div id="statisticsButtonContainer">
            <button id ="statisticsButton">x</button>
        </div>
        <div style="
                display: flex;
                flex-direction: column;
                padding-bottom: 3px;
                padding-left: 3px;
                padding-right: 3px;
                padding: 3px; 
                overflow-y: auto;
                max-height: 400px; 
                ">
            <table style="
                            display: table;
                            font-size: 16px;
                            font-style: normal;
                            font-family:sans-serif;
                            border-spacing:0px;" id="statisticsTable" cellpadding="3" cellspacing="0"
                bordercolor="black" border="1">
                <div>
                    <thead>
                        <th>Site</th>
                        <th>Time(hh:mm:ss)</th>
                    </thead>
                </div>
                <div>
                    <tbody>
                    </tbody>
                </div>
            </table>
        </div>
    </div>
    `;
        document.body.appendChild(modal);
        let dialog = document.querySelector("dialog[id=StatisticsModalWindow]");
        dialog.showModal();
        hideStatistics();
        showStatistics(stat);
        isStatDisplayed = true;
        dialog.querySelector("button[id=statisticsButton]").addEventListener("click", () => {
            console.log("MODAL close event");
            dialog.style.display = "none";
            dialog.close();
            dialog.parentNode.removeChild(dialog);
            isStatDisplayed = false;
        });
    }

    function notifyFocusChange(isInFocus) {
        let message = "focusState";
        chrome.runtime.sendMessage(null, {name: message, url: document.URL, focus: isInFocus});
    }

    function notifyFullscreenChange(isFullscreen) {
        let message = "fullscreenState";
        chrome.runtime.sendMessage(null, {name: message, url: document.URL, fullscreen: isFullscreen});
    }

    window.onfocus = function () {
        notifyFocusChange(true);
    }
    window.onblur = function () {
        if (document.activeElement.tagName.toLowerCase() === 'iframe') {
            // when iframe is focused, document loses the focus
            return;
        }
        notifyFocusChange(false);
    }

    document.onmouseenter = function () {
        notifyFocusChange(true);
    }
    document.onmouseleave = function () {
        notifyFocusChange(false);
    }
    document.onfullscreenchange = function () {
        notifyFullscreenChange(document.fullscreenElement !== null);
    }
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.name == "showModal") {
                console.log("Show statistics!");
                showModal(request.stat);
            } else if (request.name == "showAccessBlockingMessage") {
                console.log("show access blocking message!");
                document.body.style = "font-size: 20px; font-family: Arial, Helvetica, sans-serif; text-align: center; padding-top: 20%;";
                document.body.innerHTML = request.message;
                document.head.innerHTML = "";
            }
            sendResponse();
        }
    );
})()
