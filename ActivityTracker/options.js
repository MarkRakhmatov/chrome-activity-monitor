(function () {
    const STORAGE_KEY = 'timeLimits';
    const addNewUrlBtn = document.getElementById('add-new-url');
    const form = document.forms.namedItem('newUrlForm');
    const timeLimitsElement = document.querySelector('#time-limits');
    const timeLimitsTableBody = timeLimitsElement.getElementsByTagName('tbody')[0];

    // load initial data
    renderInitialData();

    // handlers
    addNewUrlBtn.addEventListener('click', (e) => {
        if (!form.checkValidity()) {
            return;
        }

        e.preventDefault();
        const formData = new FormData(form);

        return saveToStorage({
            hostname: formData.get('hostnameValue'),
            time: formData.get('timeValue'),
        })
            .then((savedValue) => {
                updateUi(savedValue);
                form.reset();
            });
    });

    function updateUi(timeLimitsData) {
        // clear existing nodes
        timeLimitsTableBody.innerHTML = '';
        const entries = Object.entries(timeLimitsData);

        entries.forEach(([hostname, timeMs]) => {
            const newRow = createTableRow({
                hostname,
                time: msToTimeStr(timeMs),
            });

            const removeBtn = newRow.querySelector('button');
            removeBtn.addEventListener('click', () => {
                removeHostnameFromStorage(hostname);
            });

            timeLimitsTableBody.appendChild(newRow);
        });
    }

    function createTableRow(settingsItem) {
        const { hostname, time } = settingsItem;
        const template = document.getElementById('settings-table-row-template');
        const hostnameCell = template.content.querySelector('.hostname');
        const timeCell = template.content.querySelector('.time-limit');

        hostnameCell.textContent = hostname;
        timeCell.textContent = time;

        return document.importNode(template.content, true);
    }

    function timeStrToMs(timeStr) {
        const [h, m] = timeStr.split(':');

        return h * 60 * 60 * 1000 + m * 60 * 1000;
    }

    function msToTimeStr(ms) {
        const dateObj = new Date(0, 1, 1, 0, 0, 0, ms);
        const hours = `${dateObj.getHours()}`;
        const minutes = `${dateObj.getMinutes()}`;
        const seconds = `${dateObj.getSeconds()}`;

        return `${prependZeros(hours)}:${prependZeros(minutes)}:${prependZeros(seconds)}`;
    }

    function prependZeros(valStr) {
        const len = valStr.length;

        if (len < 2) {
            return `0${valStr}`;
        }

        return valStr;
    }

    function removeHostnameFromStorage(hostname) {
        chrome.storage.local.get({ [STORAGE_KEY]: {} }, (oldValue) => {
            const newValue = oldValue[STORAGE_KEY];
            delete newValue[hostname];
            chrome.storage.local.set({ [STORAGE_KEY]: newValue }, () => {
                updateUi(newValue);
            });
        });
    }

    function renderInitialData() {
        chrome.storage.local.get({ [STORAGE_KEY]: {} }, (oldValue) => {
            updateUi(oldValue[STORAGE_KEY]);
        });
    }

    async function saveToStorage(hostnameTimeData) {
        return new Promise((resolve) => {
            hostnameTimeData = hostnameTimeData ?? {};
            const { hostname, time } = hostnameTimeData;
            const timeMs = timeStrToMs(time);

            chrome.storage.local.get({ [STORAGE_KEY]: {} }, (oldValue) => {
                const newValue = oldValue[STORAGE_KEY];
                newValue[hostname] = timeMs;

                chrome.storage.local.set({ [STORAGE_KEY]: newValue }, () => {
                    resolve(newValue);
                });
            });
        });
    }
})();
