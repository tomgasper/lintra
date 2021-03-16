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

        

        this._pane.addInput(this.state.INPUT, 'viewApply');
        
        this._folders.p_matrix.addInput(this.state.SCREEN_INFO, 'far_plane', {
            min: 0,
            max: 100,
          });

        this._folders.p_matrix.addInput(this.state.SCREEN_INFO, 'near_plane', {
            min: 0,
            max: 10,
        });
    }

}