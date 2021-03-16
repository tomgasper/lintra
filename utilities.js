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

export function MatrixTranspose(m)
{
    for (let i = 0; i < m.length; i++)
    {
        
    }
}