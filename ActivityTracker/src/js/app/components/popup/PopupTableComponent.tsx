import React from "react";

export interface PopupTableProps {
    statisticsMap: any
}
class PopupTableComponent extends React.Component<PopupTableProps, PopupTableProps> {

    constructor(props) {
        super(props);
        this.init();
        this.state = {statisticsMap: {}};
    }

    init() {
        chrome.runtime.sendMessage(null, {name: "getStatistics"}, {}, (response) => {
            this.setState({statisticsMap: JSON.parse(response)})
        });
    }

    render() {
        const content = Object.keys(this.state.statisticsMap).map((key, idx) => (
            <tr>
                <td>{key}</td>
                <td>{this.state.statisticsMap[key]}</td>
            </tr>
        ));

        return (
            <div className="popup-content">
                <table id="statisticsTable" className="table table-striped">
                    <thead>
                    <tr>
                        <th>Site</th>
                        <th>Time(hh:mm:ss)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {content}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default PopupTableComponent;
