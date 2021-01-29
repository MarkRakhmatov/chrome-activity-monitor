(function () {

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
class DaysCheckboxes {
    constructor(parentNode) {
        this.everyDayCheckbox = parentNode.querySelector('input[name="Every day"]');
        this.everyDayCheckbox.onclick = this.onEveryDayClicked.bind(this);
        this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.checkboxes = [];
        for(let day of this.days) {
            let dayCheckBox = parentNode.querySelector(`input[name="${day}"]`);
            dayCheckBox.onclick = this.onDayCheckboxClicked.bind(this);
            this.checkboxes.push(dayCheckBox);
        }
    }
    onEveryDayClicked(_event) {
        for(let dayCheckBox of this.checkboxes) {
            dayCheckBox.checked = true;
        }
    }
    onDayCheckboxClicked(event) {
        let clickedElement = event.target;
        if(!clickedElement.checked) {
            this.everyDayCheckbox.checked = false;
        }
    }
    getCheckedDays() {
        if(this.everyDayCheckbox.checked) {
            return ['Every day'];
        }
        let days = [];
        for(let checkbox of this.checkboxes) {
            if(checkbox.checked) {
                days.push(checkbox.name);
            }
        }
        return days;
    }
}

class SectionWithTimePeriod {
    constructor(sectionName) {
        this.sectionName = sectionName;
        this.rootNode = document.getElementById('settings-container');
        let listWithTimePeriodTemplate = document.getElementById('list-with-time-period-template');
        let listNode = this.createNodeFromTemplate(listWithTimePeriodTemplate);
        listNode.firstElementChild.setAttribute('name', this.sectionName)
        this.daysCheckBoxes = new DaysCheckboxes(listNode);
        this.prepareSection(listNode, sectionName);

        this.inputs = {
            hostnameValue : this.rootNode.querySelector('input[name="hostnameValue"]'),
            timeStart : this.rootNode.querySelector('input[name="timeStart"]'),
            timeEnd : this.rootNode.querySelector('input[name="timeEnd"]')
        }
        this.onSectionUpdate = null;
    }
    createNodeFromTemplate(template) {
        let newNode = document.importNode(template.content, true);
        return newNode;
    }
    prepareSection(newNode, sectionName) {
        let caption = newNode.querySelector('caption[name="list-type"]');
        caption.innerHTML = sectionName;
        let addButton = newNode.querySelector('button[name="add-new-url"]');
        addButton.onclick = this.onAddNewSite.bind(this);
        
        this.listWithTimePeriodNode = this.rootNode.appendChild(newNode);
    }
    onAddNewSite() {
        let updateData = {};
        for(let [key, value] of Object.entries(this.inputs)) {
            if (!value.checkValidity()) {
                value.reportValidity();
                return;
            }
            updateData[value.name] = value.value;
        }

        let table = this.rootNode.querySelector(`table[name="${this.sectionName}"]`);
        let newRow = this.createNodeFromTemplate(document.getElementById('list-with-time-period-row-template'));
        
        let body = table.querySelector('tbody');
        body.appendChild(newRow);

        updateData['days'] = this.daysCheckBoxes.getCheckedDays();
        let actionType = 'add';
        this.onSectionUpdate(updateData, actionType);
    }
}

class SectionUpdateHandler {
    constructor(settingSection) {
        this.settingsSection = settingSection;
        this.settingsSection.onSectionUpdate = this.onSectionUpdate.bind(this);
        this.storage = new StorageWrapper();
    }
    onSectionUpdate(updateData, actionType) {
        // set updated data to storage
        let dataToSave = { [this.settingsSection.sectionName]: updateData}
    }
}

class Settings {
    constructor() {
        let blackList = 'Black List';
        this.blackListSection = new SectionUpdateHandler(
            new SectionWithTimePeriod(blackList));
    }
}
    window.settingsView = new Settings();
})();
