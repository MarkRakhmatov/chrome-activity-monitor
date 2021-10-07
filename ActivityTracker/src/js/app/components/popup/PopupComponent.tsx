import React from "react";
import PopupTableComponent from "./PopupTableComponent";

export interface PropsPopup {
    isShowTable: boolean
}

class PopupComponent extends React.Component<PropsPopup, PropsPopup> {
    constructor(props) {
        super(props);
        this.state = {isShowTable: false};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({isShowTable: !this.state.isShowTable});
    }

    render() {
        const isShowTable = this.state.isShowTable;
        let table = isShowTable ? <PopupTableComponent/> : '';
        return (
            <div className="container">
                <div className="row justify-content-around">
                    <button onClick={this.handleClick} id='statistics' className="btn btn-primary btn-sm">
                        {this.state.isShowTable ? 'Hide statistics' : 'Show statistics'}
                    </button>
                    <button id='settings' className="btn btn-primary btn-sm">Settings</button>
                </div>
                {table}
            </div>
        )
    }

};

export default PopupComponent;
