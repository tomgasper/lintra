import * as THREE from '../lib/three.module.js';

export default class MyCube {
    constructor(color,size=1) {
        if (color == null || size == null || typeof color != "string" ) throw new Error("Invalid input!");

        this.model = null;
        this.geo = null;
        this.vertcies = [];
        this.indices = [];

        this.w = size/2;

        this.vertices = [
            { pos: [this.w,this.w,this.w] },
            { pos: [this.w,-this.w,this.w] },
            { pos: [-this.w,-this.w,this.w] },
        
            { pos: [-this.w,this.w,this.w] },
            { pos: [-this.w,this.w,-this.w] },
            { pos: [-this.w,-this.w,-this.w] },
        
            { pos: [this.w,this.w,-this.w] },
            { pos: [this.w,-this.w,-this.w] }
        ]
        
        this.indices = [
            0,1,2,  2,3,0,
            3,2,5,  5,4,3,
            5,7,6,  6,4,5,
            6,7,0,  0,7,1,
            3,4,0,  0,4,6,
            1,7,5,  5,2,1
        ]
        
        this.positions = [];
        
        for (const v of this.vertices)
        {
            this.positions.push(...v.pos);
        }
        
        this.geo = new THREE.BufferGeometry();
        this.positionNumComponents = 3;
        
        this.geo.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(this.positions), this.positionNumComponents)
        );
        
        this.geo.setIndex(this.indices);
        
        this.material = new THREE.MeshPhongMaterial( { color: color, transparent: false, flatShading:true, side: THREE.BackSide});
        this.model = new THREE.Mesh(this.geo, this.material);
    }

    AddToScene(scene, t = { x: 0, y: 0, z : 0}, autoUpdate = false)
    {
    const cube = this.model;
    scene.add( cube );

    const m = new THREE.Matrix4();
    m.set(
        1 ,0, 0, t.x,
        0, 1, 0 ,t.y,
        0, 0 ,1, t.z,
        0, 0, 0,  1
    );

    if (autoUpdate === false)
    {
        cube.matrixAutoUpdate = false;
    }

    // returning reference to the new object
    return cube;
    }
}