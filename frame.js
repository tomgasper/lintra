import { MyMultiplyMatrix4x4,
    MyCreateMatrixTransformation,
    MyTransposeMatrix } from "./utilities/myMath.js";

export function Frame(state, camera, model_ref)
{
    if (state.INPUT != null )
            {
                let m_output = new THREE.Matrix4();

                // Retrieve matrix data from state object
                const world_matrix = state.TryGetMatrix("w");
                const view_matrix = state.TryGetMatrix("v");
                const projection_matrix = state.GetProjectionMatrix(state.INPUT.p_progress);

                // Calculate view-projection matrix first
                // This way we only have to do 1 matrix multiplication for every other object
                let v_p_matrix = new THREE.Matrix4();
                v_p_matrix.multiplyMatrices(projection_matrix, view_matrix);        

                m_output = m_output.multiplyMatrices(v_p_matrix,world_matrix);

                // Prepare UI display data
                const transpose_w_matrix = MyTransposeMatrix(world_matrix.elements, true);
                const transpose_v_matrix = MyTransposeMatrix(view_matrix.elements, true);
                const transpose_p_matrix = MyTransposeMatrix(projection_matrix.elements, true);

                // Feed UI Monitor data
                state.UpdateMonitorMatrixData(transpose_w_matrix, transpose_v_matrix,transpose_p_matrix);

                 if (state.INPUT.projection == true)
                 {
                    let m = new THREE.Matrix4();

                    // TBC

                    // m.makeTranslation(-5,0,0);
                    // m.multiplyMatrices( m, world_matrix);
                    // m.multiplyMatrices(v_p_matrix, m);
                    // model_ref.cube2.matrix = m;
                    
                    model_ref.cube.matrix = m_output;

                    if (model_ref.camera != null)
                    {
                        model_ref.camera.lookAt(0,0,-1);
                    }
                 } else
                 {
                    if (model_ref.camera != null)
                    {
                        model_ref.camera.lookAt(0,0,1);
                    }
                    
                    let m3 = new THREE.Matrix4();
                    m3 = m3.multiplyMatrices(view_matrix,world_matrix);

                    // TBC

                    // let m2 = new THREE.Matrix4();
                    // m2.makeTranslation(-5,0,0);
                    // m2.multiplyMatrices(m2, m3);
                    // model_ref.cube2.matrix = m2;

                    model_ref.cube.matrix = m3;


                    camera.matrixAutoUpdate = true;
                 }

                 
            }
}

export function IsReadyToRender(model_refs)
{
    // traverse through model references if at least one object is null
    // we are not ready to render frame
    for(let key in model_refs)
    {
        if (model_refs[key] == null)
        {
            console.warn("Declared object " + "[" + key + "]" + " has not been initialized yet!");
            return false;
        }
    }

    return true;
}