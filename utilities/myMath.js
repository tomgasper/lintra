// Utility functions that help with matrix operations, specific calculations etc.
// Please note that these are naive and unoptimized implementations as the code
// was created for educational purposes only

export function MyTranslateTransformation(x,y,z)
{
    return 
}

export function MyCreateMatrixTransformation(t,r,s)
{
    if (t == null || r == null || s == null) throw new Error("Input is null");

    // scale matrix transform
    const m_s = [
        [ s.x,  0,  0,  0],
        [ 0,  s.y,  0,  0],
        [ 0,  0,  s.z,  0],
        [ 0,  0,  0,     1]
    ];

    // convert degrees to radians
    const rad_a = r.z * Math.PI/180;
    const rad_b = r.y * Math.PI/180;
    const rad_y = r.x * Math.PI/180;

    // find cosinus and sinus of input values
    const cos_a = Math.cos(rad_a);
    const cos_b = Math.cos(rad_b);
    const cos_y = Math.cos(rad_y);

    const sin_a = Math.sin(rad_a);
    const sin_b = Math.sin(rad_b);
    const sin_y = Math.sin(rad_y);

    const m_r = [
        [ cos_a*cos_b,  ( cos_a*sin_b*sin_y ) - (sin_a*cos_y),  (cos_a*sin_b*cos_y) + (sin_a*sin_y),  0 ],
        [ sin_a*cos_b,  ( sin_a*sin_b*sin_y ) + ( cos_a*cos_y ) ,(sin_a*sin_b*cos_y) - (cos_a*sin_y),  0 ],
        [ -sin_b,           cos_b*sin_y,                    cos_b*cos_y,                               0 ],
        [       0,                          0,                      0,                      1            ]
    ];

    // translate transform matrix
    const m_t = [
        [ 1,  0,  0,  t.x ],
        [ 0,  1,  0,  t.y ],
        [ 0,  0,  1,  t.z ],
        [ 0,  0,  0,   1   ]
    ];

    // const m1 = MyMultiplyMatrix4x4(m_s,m_r);
    // const m2 = MyMultiplyMatrix4x4(m1, m_t);

    const m1 = MyMultiplyMatrix4x4(m_t,m_r);
    const m2 = MyMultiplyMatrix4x4(m1, m_s);

    return m2;
}

export function MyProjectionMatrix(left,right, top, bottom, near_plane, far_plane,scalar)
{
    // normalize scalar
    const s = scalar/100;

    const x = 2 * near_plane / (right - left); // projected x onto the projection surface
    const y = 2 * near_plane / (top - bottom); // projected y onto the projection surface

    // map projected x to NDC x so from [l,r] to [-1,1]
    // map projected y to NDC so y from [b,t] to [-1,1]
    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom); 
    const c = -(far_plane + near_plane) / (far_plane - near_plane);
    const d = -2 * far_plane * near_plane / (far_plane - near_plane);

    let m = [];
    m[0] = x;
    m[4] = 0;
    m[8] = a;
    m[12] = 0;

    m[1] = 0;
    m[5] = y;
    m[9] = b;
    m[13] = 0;
    
    m[2] = 0;
    m[6] = 0;
    m[10] = c;
    m[14] = d;

    m[3] = 0;
    m[7] = 0;
    m[11] = -1;
    m[15] = 0;

    return m;
}

export function MyMultiplyMatrix4x4(m_L, m_R, shouldTranspose_m_R = false)
{
    if (m_L,m_R != null && Array.isArray(m_L) == true && Array.isArray(m_R) == true)
    {
        let temp_m_R = shouldTranspose_m_R ? MyTransposeMatrix(m_R) : m_R;

        let product = [
            [],[],[],[]
        ];

        if (m_L.length == 4 && temp_m_R.length == 4)
        {
            for (let i = 0; i < m_L.length; i++)
            {
                for(let j = 0; j < m_L[i].length; j++)
                {
                    let sum = 0;
                    for (let k = 0; k < temp_m_R.length; k++)
                    {
                        sum += m_L[i][k] * temp_m_R[k][j];
                    }
                    product[i].push(sum);
                }
            }
            return product;
        }
    }
    else throw new Error('Invalid Input');
}

export function MyTransposeMatrix(m, isSimpleArr = false)
{
    if (m != null && Array.isArray(m) == true)
    {
        let temp_arr = [];

        if (isSimpleArr === true)
        {
        for (let i = 0; i < m.length; i++)
            {
                temp_arr = [
                    m[0], m[4],m[8], m[12],
                    m[1], m[5], m[9], m[13],
                    m[2], m[6], m[10], m[14],
                    m[3], m[7], m[11], m[15]
                ]
            }
        } else
        {
         // prepare empty arr with the same size of input matrix
         for (let k = 0; k < m.length; k++)
         {
             temp_arr.push([]);
         }

        // transpose input matrix
        for (let i = 0; i < m.length; i++)
            {
                for (let j = 0; j < m[i].length; j++)
                {
                    temp_arr[j].push(m[i][j]);
                }
            }
        }
    
        return temp_arr;
    }
    
    throw new Error('Invalid input matrix');
}