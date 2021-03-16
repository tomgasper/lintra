import { MyMultiplyMatrix4x4,
    MyCreateMatrixTransformation,
    MyTransposeMatrix,
    MyProjectionMatrix
} from "./utilities/myMath.js";


export default class State {
    constructor() {
        this.INPUT = {
            w_scale: {x: 1, y: 1, z: 1},
            w_translate: {x: 0, y: 0, z: 0},
            w_rotate_X: 0.0,
            w_rotate_Y: 0.0,
            w_rotate_Z: 0.0,

            v_scale: {x: 1, y: 1, z: 1},
            v_translate: {x: 0, y: 0, z: 0},
            v_rotate_X: 0.0,
            v_rotate_Y: 0.0,
            v_rotate_Z: 0.0,

            viewApply: false,

            p_progress: 100
        }

        this.SCREEN_INFO = {
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near_plane: 1,
            far_plane: 10
        }

        this.PARAMS = {
            w_matrix: "",
            v_matrix: "",
            p_matrix: ""
        }


    }

    TryGetMatrix(prefix)
    {
        let t = this.INPUT[`${prefix}_translate`];
        let s = this.INPUT[`${prefix}_scale`];
        let r = {
        x : this.INPUT[`${prefix}_rotate_X`],
        y : this.INPUT[`${prefix}_rotate_Y`],
        z : this.INPUT[`${prefix}_rotate_Z`],
        }

        const m = MyCreateMatrixTransformation(t, r, s);
        const THREE_m = new THREE.Matrix4();
        THREE_m.set(
                m[0][0], m[0][1], m[0][2], m[0][3],
                m[1][0], m[1][1], m[1][2], m[1][3],
                m[2][0], m[2][1], m[2][2], m[2][3],
                m[3][0], m[3][1], m[3][2], m[3][3],
        )

        return THREE_m;
    }

    GetProjectionMatrix(scalar)
    {
        // create projection matrix
        const m = MyProjectionMatrix(this.SCREEN_INFO.left, this.SCREEN_INFO.right, this.SCREEN_INFO.top, this.SCREEN_INFO.bottom,
                                this.SCREEN_INFO.near_plane, this.SCREEN_INFO.far_plane, scalar
        );

        // convert from my matrix format to three js matrix
        const THREE_m = new THREE.Matrix4();
        // THREE_m.set(
        //             m[0][0], m[0][1], m[0][2], m[0][3],
        //             m[1][0], m[1][1], m[1][2], m[1][3],
        //             m[2][0], m[2][1], m[2][2], m[2][3],
        //             m[3][0], m[3][1], m[3][2], m[3][3],
        // )

        THREE_m.fromArray(m);

        return THREE_m;
    }
}