(function (){
    const STORAGE_KEY = 'timeLimits';
    const addNewUrlBtn = document.getElementById('add-new-url');
    const form = document.forms.namedItem('newUrlForm');
    const timeLimitsElement = document.querySelector('#time-limits');

    // handlers
    addNewUrlBtn.addEventListener('click', (e) => {
        if (!form.checkValidity()) {
            return;
        }

        const formData = new FormData(form);
        e.preventDefault();

        saveToStorage({
            hostname: formData.get('hostnameValue'),
            time: formData.get('timeValue'),
        });
    });

    function updateUi(timeLimitsData) {

    }

    // controllers
    function saveToStorage(hostnameTimeData) {
        hostnameTimeData = hostnameTimeData ?? {};
        const { hostname, time } = hostnameTimeData;

        const [h, m] = time.split(':');

        const timeMs = h * 60 * 60 * 1000 + m * 60 *  1000;

        chrome.storage.sync.get({ [STORAGE_KEY]: {} }, (oldValue) => {
            const newValue = oldValue[[STORAGE_KEY]];
            newValue[hostname] = timeMs;
            chrome.storage.sync.set({ [STORAGE_KEY]: newValue }, () => {
                timeLimitsElement.innerHTML = JSON.stringify(newValue);
            });
        });
    }
})();
