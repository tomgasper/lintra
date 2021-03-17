import { OBJLoader } from "./../lib/OBJLoader.js";

export function ParseMatrix(matrix)
{
    if (matrix != null && matrix.length === 16)
    {
        const m = [];

        for( const el of matrix)
        {
            m.push((Math.round(el*10)/10) );
        }

        let string = "";

        const s_line1 = `${m[0]} , ${m[1]} , ${m[2]} , ${m[3]}`;
        const s_line2 = `${m[4]} , ${m[5]} , ${m[6]} , ${m[7]}`;
        const s_line3 = `${m[8]} , ${m[9]} , ${m[10]} , ${m[11]}`;
        const s_line4 = `${m[12]} , ${m[13]} , ${m[14]} , ${m[15]} `;

        string = s_line1 + '\n' + s_line2 + '\n' + s_line3 + '\n' + s_line4 + '\n';

    return string;
    }
    
}

export function LoadModel(name,scene,model_ref){
    const loader = new OBJLoader();

    if (name != null){
        loader.load(
            `assets/${name}.obj`, (obj) =>{
                var mat = new THREE.MeshPhongMaterial( {wireframe:true, wireframeLinecap: "round", color: 0xffffff} );
                obj.children[0].material = mat;

                const edges = new THREE.EdgesGeometry( obj.children[0].geometry );
                edges.scale(2.5,2,2);

                const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
                scene.add(line);

                line.lookAt(0,0,1);
                
                // save reference
                model_ref.camera = line;

                console.log("Object " + "[" + name + "]" + " has been sucesfully loaded and initialized");
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