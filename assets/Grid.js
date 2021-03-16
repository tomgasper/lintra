import * as THREE from '../lib/three.module.js';

export default class MyGrid {
    constructor(color, lineCount = 80) {
        this.color = color;
        this.lineCount = lineCount;

        this.model = null;
        this.geo = null;

        this.verticies = [];
        this.indices = [];
        this.positions = [];

        
        this.offset = 1;

        this.width = this.offset * this.lineCount;
        this.height = this.offset*this.lineCount;

        for (let i = 0; i <= lineCount; i++)
        {
            this.positions.push(
                // horizontal line
                (this.width/2),0, this.offset*i-this.height/2,
                (-this.width/2),0, this.offset*i-this.height/2,

                // vertical line
                this.offset*i-this.width/2,0, this.height/2,
                this.offset*i-this.width/2,0, -this.height/2,
            )
        }

        // for (const v of this.vertices)
        // {
        //     this.positions.push(...v.pos);
        // }
        
        this.geo = new THREE.BufferGeometry();
        this.positionNumComponents = 3;
        
        this.geo.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(this.positions), this.positionNumComponents)
        );
        
        this.material = new THREE.LineBasicMaterial( { color: this.color });
        this.model = new THREE.LineSegments(this.geo, this.material);
    }
}