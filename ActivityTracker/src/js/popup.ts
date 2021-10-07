import './../css/popup.css';
import {ToggleStatistic} from "./enums/toggleStatistic";
import 'bootstrap/dist/css/bootstrap.min.css';
import './app/index';

const CLASS_HIDDEN = 'visually-hidden';

export class StatisticComponent {
    private table: HTMLElement | null;
    private statisticsBtnId: HTMLElement;
    private isStatDisplayed: boolean | undefined;

    constructor(statisticsBtnId: HTMLElement, tableStatisticId: string) {
        this.table = document.getElementById(tableStatisticId);
        this.statisticsBtnId = statisticsBtnId;
    }

    public toggleStatistics() {
        if (this.isStatDisplayed) {
            this.hideStatistics();
            this.statisticsBtnId.innerHTML = ToggleStatistic.OPEN;
        } else {
            this.showStatistics();
            this.statisticsBtnId.innerHTML = ToggleStatistic.CLOSE;
        }
        this.isStatDisplayed = !this.isStatDisplayed;
    }

    private hideStatistics() {
        this.table!.classList.add(CLASS_HIDDEN);
        const tbodyRef = this.table!.getElementsByTagName('tbody')[0];
        tbodyRef.innerHTML = '';
    }


    private showStatistics() {
        chrome.runtime.sendMessage(null, {name: "getStatistics"}, {}, (response) => {
            const tbodyRef = this.table!.getElementsByTagName('tbody')[0];
            const statisticsMap = JSON.parse(response);
            const tmpl = (name: string, value: any) => `<tr>
                                                <td>${name}</td>
                                                <td>${value}</td>
                                           </tr>`;
            const html = Object.keys(statisticsMap).reduce((acc, value) => {
                acc += tmpl(value, statisticsMap[value]);
                return acc;
            }, '');
            tbodyRef.insertAdjacentHTML('beforeend', html);
            this.table!.classList.remove(CLASS_HIDDEN);
        });
    }
}

export class PopupComponent {
    public statisticsBtn: HTMLElement | null;
    private settingBtnId: HTMLElement | null;
    private readonly statisticComponent: StatisticComponent;

    constructor(statisticsBtnId: string, settingBtnId: string, tableStatisticId: string) {
        this.statisticsBtn = document.getElementById(statisticsBtnId);
        this.settingBtnId = document.getElementById(settingBtnId);
        this.statisticComponent = new StatisticComponent(this.statisticsBtn!, tableStatisticId);
    }

    init() {
        this.addListeners();
    }

    addListeners() {
        this.statisticsBtn!.addEventListener('click', this.statisticComponent.toggleStatistics.bind(this.statisticComponent));
        this.settingBtnId!.addEventListener('click', this.openOptions.bind(this));
    }

    openOptions() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const popupComponent = new PopupComponent('statistics', 'settings', 'statisticsTable');
    popupComponent.init();
});
