import * as T from "./lib/three.js";
import { DragControls } from "./lib/DragControls.js"; 
import { OBJLoader } from "./lib/OBJLoader.js";
import { Vector3,Mesh } from "./lib/three.module.js";

import Cube from "./assets/Cube.js";
import Grid from "./assets/Grid.js";

import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

import State from "./state.js";

import UI_Ctrl from "./UI.js"

import { ParseMatrix } from "./utilities.js";
import { MyMultiplyMatrix4x4,
         MyCreateMatrixTransformation,
         MyTransposeMatrix } from "./myMath.js";

// INIT State object
const state = new State();

// INIT THREE.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000);
const loader = new OBJLoader();
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1.5 );
light.position.set(3,4,1);
scene.add( light );

// INIT THREE.js render
const renderer = new THREE.WebGLRenderer();
const container = document.getElementById("canvas");
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

// INIT UI Controller
const UI_Controller = new UI_Ctrl(state);

// INIT Scene elements

const cube = new Cube("#3a49f2",2).model;
const cube2 = new Cube("#3a49f2",2).model;
const cube3 = new Cube("#3a49f2",2).model;

const grid = new Grid("#808080").model;

const myCube = scene.add( cube );
const myCube2 = scene.add( cube2 );
const myCube3 = scene.add( cube3 );

const cube2_m = new THREE.Matrix4();

cube2_m.set(
    1,0,0,4,
    0,1,0,0,
    0,0,1,-4,
    0,0,0,1
);

cube2.matrixAutoUpdate = false;

cube2.matrix = cube2_m;

const cube3_m = new THREE.Matrix4();

cube3_m.set(
    1,0,0,-4,
    0,1,0,0,
    0,0,1,-4,
    0,0,0,1
)

cube3.matrixAutoUpdate = false;

cube.matrixAutoUpdate = false;

const myGrid = scene.add( grid );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );


// INIT Camera settings
camera.position.set(3,3,-5);



// INIT Controllers
const orbitControls = new OrbitControls( camera, renderer.domElement );

//
// Hard coded load 
function LoadModel(name){
    if (name != null){
        loader.load(
            `assets/${name}.obj`, (obj) =>{
                var mat = new THREE.MeshPhongMaterial( {wireframe:true, wireframeLinecap: "round", color: 0xffffff} );

                const edges = new THREE.EdgesGeometry( obj.children[0].geometry );

                const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
        
                obj.children[0].material = mat;
        
                scene.add(line);

                line.lookAt(0,0,-1);
                line.position.set(0,0,-0);
                edges.scale(2.5,2,2);
            },
            (xhr) => {
                console.log( (xhr.loaded/ xhr.total * 100))
            },
            (err) => {
                console.log("Loader.load Error: " + err);
            }
        );
    }
}

let icon = LoadModel("camera");

function render(time) {
    time *= 0.001;  // convert time to seconds

    requestAnimationFrame(render);

    if (myCube != null)
    {
        // cube.position.x = time;
    }

    if (UI_Controller != null)
    {
        if (cube != null)
        {
            Frame(time);
        }
        
    }
    
    renderer.render(scene, camera);
}

function Frame(time)
{
    if (state.INPUT != null)
            {
                let m_output = new THREE.Matrix4();
                const world_matrix = state.TryGetMatrix("w");
                const view_matrix = state.TryGetMatrix("v");
                
                const projection_matrix = state.GetProjectionMatrix(state.INPUT.p_progress);

                m_output = m_output.multiplyMatrices(view_matrix,world_matrix);
                m_output = m_output.multiplyMatrices(projection_matrix, m_output);

                

                const transpose_w_matrix = MyTransposeMatrix(world_matrix.elements, true);
                const transpose_v_matrix = MyTransposeMatrix(view_matrix.elements, true);
                const transpose_p_matrix = MyTransposeMatrix(projection_matrix.elements, true);

                UpdateMonitorMatrixData(transpose_w_matrix, transpose_v_matrix,transpose_p_matrix);

                 if (state.INPUT.viewApply == true)
                 {
                    cube2.matrixAutoUpdate = false;
                    cube3.matrixAutoUpdate = false;

                    let m = new THREE.Matrix4();

                    m = m.multiplyMatrices(view_matrix,cube2_m);
                    m = m.multiplyMatrices(projection_matrix,m);

                    let m2 = new THREE.Matrix4();

                    m2 = m2.multiplyMatrices(view_matrix,cube3_m);
                    m2 = m2.multiplyMatrices(projection_matrix,m2);

                    cube2.matrix = m;
                    cube3.matrix = m2;

                    cube.matrix = m_output;

                     
                 }
                 else
                 {
                    
                    grid.position.set(0,0,0);

                    let m3 = new THREE.Matrix4();

                    

                    m3 = m3.multiplyMatrices(view_matrix,world_matrix);

                    cube.matrix = m3;
                    cube2.matrix = cube2_m;
                    cube3.matrix = cube3_m;
                    camera.matrixAutoUpdate = true;
                    grid.matrixAutoUpdate = true; 
                 }

                 // applying both WORLD and VIEW matrix to cube matrix
                 
            }
}

function UpdateMonitorMatrixData(m1,m2,m3)
{
    const str_worldMatrix = ParseMatrix(m1);
    state.PARAMS.w_matrix = str_worldMatrix;

    const str_viewMatrix = ParseMatrix(m2);
    state.PARAMS.v_matrix = str_viewMatrix;

    const str_projectionMatrix = ParseMatrix(m3);
    state.PARAMS.p_matrix = str_projectionMatrix;
}

requestAnimationFrame(render);