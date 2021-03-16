import MatrixBase from "./MatrixBase.js";

export default class UI_Ctrl {

    constructor(state) {
        this._pane = new Tweakpane({
            title: 'Parameters'
        });

        this.state = state;

        // create seperate UI folders for each matrix
        // passing reference to this object to keep things clean
        this._folders = {
            w_matrix : new MatrixBase(0, this),
            v_matrix : new MatrixBase(1, this),
            p_matrix : new MatrixBase(2, this),
        };
        
    }

}