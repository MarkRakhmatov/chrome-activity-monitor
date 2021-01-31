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

function createNodeFromTemplate(template) {
    let newNode = document.importNode(template.content, true);
    return newNode;
}

class DaysCheckboxes {
    constructor(parentNode) {
        this.everyDayCheckbox = parentNode.querySelector('input[name="Every day"]');
        this.everyDayCheckbox.setCustomValidity("Select at least one day!");
        this.everyDayCheckbox.onclick = this.onEveryDayClicked.bind(this);
        this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.checkboxes = {};
        for(let day of this.days) {
            let dayCheckBox = parentNode.querySelector(`input[name="${day}"]`);
            dayCheckBox.onclick = this.onDayCheckboxClicked.bind(this);
            this.checkboxes[day] = dayCheckBox;
        }
    }
    onEveryDayClicked(_event) {
        let allDaysValue =this.everyDayCheckbox.checked;
        for(let [day, dayCheckBox] of Object.entries(this.checkboxes)) {
            dayCheckBox.checked = allDaysValue;
        }
    }
    onDayCheckboxClicked(event) {
        let clickedElement = event.target;
        if(!clickedElement.checked) {
            this.everyDayCheckbox.checked = false;
        }
    }
    setInputs(daysArray) {
        this.cleanUp();
        if(daysArray[0] == 'Every day') {
            this.everyDayCheckbox.checked = true;
            this.onEveryDayClicked();
            return;
        }
        for(let day of daysArray) {
            this.checkboxes[day].checked = true;
        }
    }
    cleanUp() {
        this.everyDayCheckbox.checked = false;
        this.onEveryDayClicked();
    }
    getCheckedDays() {
        if(this.everyDayCheckbox.checked) {
            return ['Every day'];
        }
        let days = [];
        for(let [day, checkbox] of Object.entries(this.checkboxes)) {
            if(checkbox.checked) {
                days.push(checkbox.name);
            }
        }
        return days;
    }
    reportValidity() {
        this.everyDayCheckbox.reportValidity();
    }
}

function highlight(element){
    let defaultBG = element.style.backgroundColor;
    let defaultTransition = element.style.transition;

    element.style.transition = "background 1s";
    element.style.backgroundColor = "#FDFF47";
    setTimeout(function()
    {
        element.style.backgroundColor = defaultBG;
        setTimeout(function() {
            element.style.transition = defaultTransition;
        }, 1000);
    }, 1000);
}

class SettingsGeneratingRow {
    constructor(table, inputsNames, onRowAddadCallback) {
        this.inputsNames = inputsNames;
        this.table = table;
        this.inputs = {};
        for(let inputName of this.inputsNames) {
            this.inputs[inputName] = this.table.querySelector(`input[name="${inputName}"]`);
        }
        this.table.querySelector('[class="days-checkboxes"]');
        this.daysCheckBoxes = new DaysCheckboxes(table);
        
        let addButton = table.querySelector('button[name="add-new-url"]');
        addButton.onclick = this.onAddNewSite.bind(this);

        this.onRowAddadCallback = onRowAddadCallback;
    }
    
    setInputsData(newRowData) {
        for(let inputName of this.inputsNames) {
            this.inputs[inputName].value = newRowData[inputName];
        }
        this.daysCheckBoxes.setInputs(newRowData.days.split(',\n'));
    }
    cleanupInputs() {
        for(let inputName of this.inputsNames) {
            this.inputs[inputName].value = '';
        }
        this.daysCheckBoxes.cleanUp();
    }
    onAddNewSite() {
        let newRowData = {};
        for(let [key, value] of Object.entries(this.inputs)) {
            if (!value.checkValidity()) {
                value.reportValidity();
                return;
            }
            newRowData[value.name] = value.value;
        }

        newRowData['days'] = this.daysCheckBoxes.getCheckedDays().join(',\n');
        if(!newRowData['days'].length) {
            this.daysCheckBoxes.reportValidity();
            return;
        }

        this.onRowAddadCallback(newRowData, 2);
        this.cleanupInputs();
        this.daysCheckBoxes.cleanUp();
    }
}

class SectionWithTimePeriodBody {
    constructor(cellNames, table,  settingsGeneratingRow) {
        this.cellNames = cellNames;
        this.settingsTable = table;
        this.settingsGeneratingRow = settingsGeneratingRow;
        this.buttonToHandler = {
            change : this.changeUrlHandler.bind(this),
            duplicate : this.duplicateUrlHandler.bind(this),
            remove : this.removeUrlHandler.bind(this),
        };
    }
    setCellValue(row, name, value) {
        let cell = row.querySelector(`[name="${name}"]`);
        cell.innerHTML = value;
    }
    getCellData(row, name) {
        let cell = row.querySelector(`[name="${name}"]`);
        let cellValue = cell.innerHTML;
        if(!cellValue || !cellValue.length) {
            throw 'Empty cell!';
        }
        return cellValue;
    }
    getRowData(row) {
        let rowData = {};
        
        let siteName = 'site';
        rowData[siteName] = this.getCellData(row, siteName);

        let timeStartName = 'timeStart';
        rowData[timeStartName] = this.getCellData(row, timeStartName);

        let timeEndName = 'timeEnd';
        rowData[timeEndName] = this.getCellData(row, timeEndName);
 
        let daysName = 'days';
        rowData[daysName] = this.getCellData(row, daysName);
        return rowData;
    }
    removeRow(index) {
        if(!index)
        {
            console.log('invalidRow');
            return;
        }
        this.settingsTable.deleteRow(index);
    }

    changeUrlHandler(event) {
        let originalRow = event.target.parentNode.parentNode.parentNode.parentNode;
        let newRowData = this.getRowData(originalRow);
        this.settingsGeneratingRow.setInputsData(newRowData);
        this.settingsTable.scrollIntoView();
        highlight(this.settingsTable.querySelector('tr[name="add-new-site-row"]'));
        this.removeRow(originalRow.rowIndex);
    }
    duplicateUrlHandler(event) {
        let originalRow = event.target.parentNode.parentNode.parentNode.parentNode;
        try {
            let newRowData = this.getRowData(originalRow);
            this.addNewRow(newRowData, originalRow.rowIndex+1);
        } catch (error) {
            console.log('Failed to duplicate row!');
        }
    }
    removeUrlHandler(event) {
        let originalRow = event.target.parentNode.parentNode.parentNode.parentNode;
        this.removeRow(originalRow.rowIndex);
    }
    setEventHandlers(actionsContainer) {
        for(let [buttonName, handler] of Object.entries(this.buttonToHandler)) {
            let button = actionsContainer.querySelector(`[name="${buttonName}"]`);
            button.onclick = handler;
        }
    }
    addNewRow(newRowData, index) {
        let newRow = createNodeFromTemplate(document.getElementById('list-with-time-period-row-template'));
        
        for(let cellName of this.cellNames) {
            this.setCellValue(newRow, cellName, newRowData[cellName]);
        }
        let row = this.settingsTable.insertRow(index);
        row.setAttribute('class', 'settings-row');
        row.innerHTML = newRow.children[0].innerHTML;
        let actionsContainer = row.querySelector('[name="settings-table-actions"]')
        this.setEventHandlers(actionsContainer);
        highlight(row);
    }
}


class SectionWithTimePeriod {
    constructor(sectionName) {
        this.sectionName = sectionName;
        let listWithTimePeriodTemplate = document.getElementById('list-with-time-period-template');
        let listNode = createNodeFromTemplate(listWithTimePeriodTemplate);
        listNode.querySelector('table[class="table-style"]').setAttribute('name', this.sectionName);
        let caption = listNode.querySelector('caption[name="list-type"]');
        caption.innerHTML = sectionName;
        
        this.rootNode = document.getElementById('settings-container');
        this.listWithTimePeriodNode = this.rootNode.appendChild(listNode);
        this.settingsTable = this.rootNode.querySelector(`table[name="${this.sectionName}"]`);
        
        let inputNames = ['site', 'timeStart', 'timeEnd'];
        this.settingsGeneratingRow = new SettingsGeneratingRow(this.settingsTable, inputNames, this.addNewRow.bind(this))
        
        let cellNames = ['site', 'timeStart', 'timeEnd', 'days'];
        this.settingsTableBody = new SectionWithTimePeriodBody(cellNames, this.settingsTable, this.settingsGeneratingRow);
    }
    getAllData() {
        let tableDataSet = Set();
        for(let row of this.settingsTable.rows) {
            tableDataSet.push(this.getRowData(row));
        }
        let tableData = {};
        for(let row in tableDataSet) {
            tableData[row.rowIndex] = row;
        }
        return {[this.sectionName]: tableData};
    }
    addNewRow(rowData, index) {
        this.settingsTableBody.addNewRow(rowData, index);
    }
}

class SectionUpdateHandler {
    constructor(settingSection) {
        this.settingsSection = settingSection;
        this.storage = new StorageWrapper();
    }
    updateStorage() {

    }
}

class Settings {
    constructor() {
        let blackList = 'Black List';
        this.blackListSection = new SectionUpdateHandler(
            new SectionWithTimePeriod(blackList));
        let whiteList = 'White List';
        this.whiteListSection = new SectionUpdateHandler(
            new SectionWithTimePeriod(whiteList));
    }
}
    window.settingsView = new Settings();
})();
