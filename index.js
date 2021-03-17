import * as T from "./lib/three.js";
import Cube from "./assets/Cube.js";
import Grid from "./assets/Grid.js";

import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

import State from "./State.js";
import UI_Ctrl from "./ui/UI_Window.js"
import { LoadModel } from "./utilities/utilities.js";
import { Frame, IsReadyToRender } from "./frame.js";

// INIT object that is going to hold app's (simple) state
const state = new State();

// INIT THREE.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3,3,-5);
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1.5 );
light.position.set(3,4,1);
scene.add( light );

// INIT THREE.js Renderer
const renderer = new THREE.WebGLRenderer();
const container = document.getElementById("canvas");
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

// INIT Orbit Controller
const orbitControls = new OrbitControls( camera, renderer.domElement );

// INIT UI Panel
const UI_Controller = new UI_Ctrl(state);

// INIT reference holder for models that are going to be loaded
var _model_ref = {
    camera: null,
    grid: null,
    cube: null,
    axesHelper: null,
}

// INIT Scene elements
_model_ref.grid = new Grid("#808080").AddToScene(scene);
_model_ref.cube = new Cube("#3a49f2",2).AddToScene(scene);

// _model_ref.cube2 = new Cube("#3a49f2",2).AddToScene(scene);

_model_ref.axesHelper = new THREE.AxesHelper( 5 );
scene.add( _model_ref.axesHelper );

// Load external 3d object pass in ref to object holder
LoadModel("camera", scene, _model_ref);

function render(time) {
    time *= 0.001;  // convert time to seconds

    requestAnimationFrame(render);

    if (UI_Controller != null)
    {
        if ( IsReadyToRender(_model_ref) === true )
        {
            Frame(state, camera, _model_ref);
        }
        
    }
    
    renderer.render(scene, camera);
}

requestAnimationFrame(render);