import './../css/options.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app/index';

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
    return document.importNode(template.content, true);
}

class DaysCheckboxes {
    private everyDayCheckbox: any;
    private readonly days: string[];
    private checkboxes: any;

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

function highlight(element) {
    let settingsContainer = document.getElementById('settings-container');
    if(settingsContainer.style.display === 'none') {
        return;
    }
    let defaultBG = element.style.backgroundColor;
    let defaultTransition = element.style.transition;

    element.style.transition = "background 0.5s";
    element.style.backgroundColor = "#FFFF87";
    setTimeout(function()
    {
        element.style.backgroundColor = defaultBG;
        setTimeout(function() {
            element.style.transition = defaultTransition;
        }, 500);
    }, 500);
}

class SettingsGeneratingRow {
    constructor(table, inputnameToValidator) {
        this.inputsNames = Object.keys(inputnameToValidator);
        this.table = table;
        this.inputs = {};
        for(let [inputName, inputValidator] of Object.entries(inputnameToValidator)) {
            this.inputs[inputName] = {
                element : this.table.querySelector(`[name="${inputName}"]`),
                validator : inputValidator
            };
        }
        this.table.querySelector('[class="days-checkboxes"]');
        this.daysCheckBoxes = new DaysCheckboxes(table);

        let addButton = table.querySelector('button[name="add-new-url"]');
        addButton.onclick = this.onAddNewSite.bind(this);

        this.onRowAddedCallback;
    }

    setInputsData(newRowData) {
        for(let inputName of this.inputsNames) {
            this.inputs[inputName].element.value = newRowData[inputName];
        }
        this.daysCheckBoxes.setInputs(newRowData.days.split(',\n'));
    }
    cleanupInputs() {
        for(let inputName of this.inputsNames) {
            this.inputs[inputName].element.value = '';
        }
        this.daysCheckBoxes.cleanUp();
    }
    onAddNewSite() {
        let newRowData = {};
        for(let [_key, value] of Object.entries(this.inputs)) {
            if (!value.validator(value.element)) {
                value.element.reportValidity();
                return;
            }
            newRowData[value.element.name] = value.element.value.trim();
        }

        newRowData['days'] = this.daysCheckBoxes.getCheckedDays().join(',\n');
        if(!newRowData['days'].length) {
            this.daysCheckBoxes.reportValidity();
            return;
        }

        this.onRowAddedCallback(newRowData, 2);
        this.cleanupInputs();
        this.daysCheckBoxes.cleanUp();
    }
}

class SectionWithTimePeriodBody {
    constructor(cellNames, rowTemplateName, table,  settingsGeneratingRow) {
        this.cellNames = cellNames;
        this.rowTemplateName = rowTemplateName;
        this.settingsTable = table;
        this.settingsGeneratingRow = settingsGeneratingRow;
        this.buttonToHandler = {
            change : this.changeUrlHandler.bind(this),
            duplicate : this.duplicateUrlHandler.bind(this),
            remove : this.removeUrlHandler.bind(this),
        };
        this.onSectionChangedCallback;
    }
    initFromStorage(storageObject) {
        let settingsContainer = document.getElementById('settings-container');
        settingsContainer.style.display = 'none';
        for(let [_i, row] of Object.entries(storageObject)) {
            this.addNewRow(row, -1);
        }
        settingsContainer.style.display = 'flex';
    }
    setCellValue(row, name, value) {
        let cell = row.querySelector(`[name="${name}"]`);
        cell.innerHTML = value;
    }
    getCellData(row, name) {
        let cell = row.querySelector(`[name="${name}"]`);
        let cellValue = cell.innerHTML;
        return cellValue;
    }
    getRowData(row) {
        let rowData = {};

        for(let cellName of this.cellNames) {
            rowData[cellName] = this.getCellData(row, cellName);
        }
        return rowData;
    }
    getAllData() {
        let tableData = [];
        let rows = this.settingsTable.rows;
        let rowsSize = rows.length;
        for(let i = 2; i < rowsSize; ++i) {
            tableData.push(this.getRowData(rows[i]));
        }
        return tableData;
    }
    removeRow(index) {
        this.settingsTable.deleteRow(index);
        this.onSectionChangedCallback(this.getAllData());
    }
    changeUrlHandler(event) {
        let originalRow = event.target.parentNode.parentNode.parentNode;
        let newRowData = this.getRowData(originalRow);
        this.settingsGeneratingRow.setInputsData(newRowData);
        this.settingsTable.scrollIntoView();
        highlight(this.settingsTable.querySelector('tr[name="add-new-site-row"]'));
        this.removeRow(originalRow.rowIndex);
    }
    duplicateUrlHandler(event) {
        let originalRow = event.target.parentNode.parentNode.parentNode;
        let newRowData = this.getRowData(originalRow);
        this.addNewRow(newRowData, originalRow.rowIndex+1);
    }
    removeUrlHandler(event) {
        let originalRow = event.target.parentNode.parentNode.parentNode;
        this.removeRow(originalRow.rowIndex);
    }
    setEventHandlers(actionsContainer) {
        for(let [buttonName, handler] of Object.entries(this.buttonToHandler)) {
            let button = actionsContainer.querySelector(`[name="${buttonName}"]`);
            button.onclick = handler;
        }
    }
    addNewRow(newRowData, index) {
        let newRow = createNodeFromTemplate(document.getElementById(this.rowTemplateName));

        for(let cellName of this.cellNames) {
            this.setCellValue(newRow, cellName, newRowData[cellName]);
        }
        let row = this.settingsTable.insertRow(index);
        row.setAttribute('class', 'settings-row');
        row.innerHTML = newRow.children[0].innerHTML;
        let actionsContainer = row.querySelector('[name="settings-table-actions"]')
        this.setEventHandlers(actionsContainer);
        highlight(row);
        this.onSectionChangedCallback(this.getAllData());
    }
}

function defaultInputValidator(element) {
    return element.checkValidity();
}
function timePeriodValidator(timeEndElement) {
    let row = timeEndElement.parentNode.parentNode;
    let timeStart = row.querySelector('input[name="timeStart"]');
    timeEndElement.setCustomValidity("\"Time End\" should be greater then \"Time Start\"");
    return timeEndElement.value.localeCompare(timeStart.value) > 0;
};
function sitesListValidator(sitesElement) {
    let sitesListstr = sitesElement.value;
    let regSites = new RegExp("^(((([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]))\s*\n*\r*)+$");
    sitesElement.setCustomValidity("Invalid syntax!");
    return regSites.test(sitesListstr);
};

class SectionWithTimePeriod {
    constructor(sectionName, tableTemplateName, rowTemplateName, cellNames, inputnameToValidator) {
        this.sectionName = sectionName;
        let tableTemplate = document.getElementById(tableTemplateName);
        let tableNode = createNodeFromTemplate(tableTemplate);
        tableNode.querySelector('table[class="table-style"]').setAttribute('name', this.sectionName);
        let caption = tableNode.querySelector('caption[name="list-type"]');
        caption.innerHTML = sectionName;

        this.rootNode = document.getElementById('settings-container');
        this.listWithTimePeriodNode = this.rootNode.appendChild(tableNode);
        this.settingsTable = this.rootNode.querySelector(`table[name="${this.sectionName}"]`);

        this.settingsGeneratingRow = new SettingsGeneratingRow(this.settingsTable, inputnameToValidator);

        this.settingsTableBody = new SectionWithTimePeriodBody(cellNames, rowTemplateName, this.settingsTable, this.settingsGeneratingRow);
        this.settingsGeneratingRow.onRowAddedCallback = this.settingsTableBody.addNewRow.bind(this.settingsTableBody);
    }
    initFromStorage(storageObject) {
        if(!Object.entries(storageObject).length) {
            return;
        }
        this.settingsTableBody.initFromStorage(storageObject[this.sectionName]);
    }
    setSectionChangeListener(listener) {
        this.settingsTableBody.onSectionChangedCallback = listener;
    }
}

class SectionUpdateHandler {
    constructor(settingSection) {
        this.storage = new StorageWrapper();
        this.settingsSection = settingSection;
        this.settingsSection.setSectionChangeListener(this.saveTableDataToStorage.bind(this));
        this.initTableDataFromStorage();
    }
    saveTableDataToStorage(tableData) {
        this.storage.set(this.settingsSection.sectionName, tableData)
    }
    initTableDataFromStorage() {
        this.storage.get(this.settingsSection.sectionName).then(
            this.settingsSection.initFromStorage.bind(this.settingsSection));
    }
}
function createTimePeriodSection(sectionName)
{
    let tableTemplateName = 'list-with-time-period-template';
    let rowTemplateName = 'list-with-time-period-row-template';
    let cellNames = ['site', 'timeStart', 'timeEnd', 'days'];
    let inputnameToValidator = {
        'site' : sitesListValidator,
        'timeStart' : defaultInputValidator,
        'timeEnd' : timePeriodValidator};
    return new SectionWithTimePeriod(
        sectionName,
        tableTemplateName,
        rowTemplateName,
        cellNames,
        inputnameToValidator);
}
function createTimeIntervalSection(sectionName)
{
    let tableTemplateName = 'list-with-time-interval-template';
    let rowTemplateName = 'list-with-time-interval-row-template';
    let cellNames = ['site', 'timeInterval', 'days'];
    let inputnameToValidator = {
        'site' : sitesListValidator,
        'timeInterval' : defaultInputValidator};
    return new SectionWithTimePeriod(
        sectionName,
        tableTemplateName,
        rowTemplateName,
        cellNames,
        inputnameToValidator);
}
class Settings {
    constructor() {
        let blackList = 'Black List';
        this.blackListSection = new SectionUpdateHandler(
            createTimePeriodSection(blackList));

        let whiteList = 'White List';
        this.whiteListSection = new SectionUpdateHandler(
            createTimePeriodSection(whiteList));

        let limitedAccessList = 'Limited Access List';
        this.limitedAccesSsection = new SectionUpdateHandler(
            createTimeIntervalSection(limitedAccessList));
    }
}

    window.settingsView = new Settings();
