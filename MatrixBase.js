export default class MatrixBase {
    constructor(id, ctrl_ref){
        this.folder = null;
        this.id = id;
        this.name = "";
        this.prefix = '';

        switch (this.id)
        {
            case 0 :
                this.name = "World";
                this.prefix = 'w';
                break;
            case 1 :
                this.name = "View";
                this.prefix = 'v';
                break;
            case 2 :
                this.name = "Projection";
                this.prefix = 'p';
                break;
            default:
                throw new Error("Wrong input name!");
        }

        // Initialize folder with provided string
        this.folder = ctrl_ref._pane.addFolder({
            title: `${this.name} Matrix`
            });

        this.folder.addMonitor(ctrl_ref.state.PARAMS, `${this.prefix}_matrix`, {
            multiline: true,
            lineCount: 5,
            });

        // Parameters for World and View Matrix Windows
        if (this.prefix != 'p')
        {
            this.folder.addInput(ctrl_ref.state.INPUT, `${this.prefix}_rotate_X`, {
                min: -180,
                max: 180,
            });
    
            this.folder.addInput(ctrl_ref.state.INPUT, `${this.prefix}_rotate_Y`, {
                min: -180,
                max: 180,
            });
    
            this.folder.addInput(ctrl_ref.state.INPUT, `${this.prefix}_rotate_Z`, {
                min: -180,
                max: 180,
            });
    
            this.folder.addInput(ctrl_ref.state.INPUT, `${this.prefix}_scale`, {
            });
    
            this.folder.addInput(ctrl_ref.state.INPUT, `${this.prefix}_translate`, {
            });
        }
        // Parameters for Projection Matrix Windows
        else
        {
            this.folder.addInput(ctrl_ref.state.SCREEN_INFO, 'far_plane', {
                min: 0,
                max: 100,
            });

            this.folder.addInput(ctrl_ref.state.SCREEN_INFO, 'near_plane', {
                min: 0,
                max: 10,
            });

            this.folder.addInput(ctrl_ref.state.INPUT, 'viewApply');
        }

        return this.folder
        ;
    }
}