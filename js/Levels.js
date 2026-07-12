export const blockType = {
    Y: { color: 0xD7C74C, hp: 2 }, 
    B: { color: 0x409692, hp: 1 },
    P: { color: 0xF765AA, hp: 1 },
    G: { color: 0x74C25E, hp: 1 }, 
    L: { color: 0xFFA89F, hp: 1 },
    S: { color: 0xC7BCB9, hp: 1 }
};

export function getBlockType(char) {
    return blockType[char];
};

export const levels = [
    {
        num: 1,
        map: [
            'YYYYYYYYYYY',
            'BBBBBBBBBBB',
            'PPPPPPPPPPP',
            'GGGGGGGGGGG',
            'LLLLLLLLLLL',
            'SSSSSSSSSSS'
        ]
    },
    {
        num: 2,
        map: [
            'S          ',
            'SL         ',
            'SLG        ',
            'SLGP       ',
            'SLGPB      ',
            'SLGPBS     ',
            'SLGPBSL    ',
            'SLGPBSLG   ',
            'SLGPBSLGP  ',
            'SLGPBSLGPB ',
            'YYYYYYYYYYS'
        ]
    },
    {
        num: 3,
        map: [
            ' YBPG BPLY ',
            ' LPBS PBYL ',
            ' PGSB LYBP ',
            ' BSGP YLPB ',
            ' SBPL BPGS ',
            ' GPBY PBSG ',
            ' PLYB GSBP ',
            ' BYLP SGPB ',
            ' YBPG BPLY ',
            ' LPBS PBYL ',
            ' PGSB LYBP ',
            ' BSGP YLPB ',
            ' SBPL BPGS ',
            ' GPBY PBSG '
        ]
    },
    {
        num: 4,
        map: [
            '   B   B   ',
            '    B B    ',
            '    B B    ',
            '   YYYYY   ',
            '   YYYYY   ',
            '  YYGYGYY  ',
            '  YYGYGYY  ',
            ' YYYYYYYYY ',
            ' YYYYYYYYY ',
            ' Y YYYYY Y ',
            ' Y Y   Y Y ',
            ' Y Y   Y Y ',
            '    Y Y    ',
            '    Y Y    '
        ]
    },
    {
        num: 5,
        map: [
            'B P G G P B',
            'B P G G P B',
            'B P G G P B',
            'B YLYLYLY B',
            'B P G G P B',
            'B P G G P B',
            'B P G G P B',
            'B P G G P B',
            'B P G G P B',
            'L Y Y Y Y L',
            'B P G G P B',
        ]
    }
];
export function validateLevel(level) {
    const { map } = level;
    if (!map || !Array.isArray(map) || map.length === 0) {
        return { valid: false, error: 'Карта не определена' };
    }
    
    const width = map[0].length;
    for (let i = 0; i < map.length; i++) {
        if (map[i].length !== width) {
            return { valid: false, error: `Строка ${i} имеет неверную длину` };
        }
        
        for (let j = 0; j < map[i].length; j++) {
            const char = map[i][j];
            if (char !== ' ' && !blockType[char]) {
                return { 
                    valid: false, 
                    error: `Неизвестный символ "${char}" на позиции [${i}][${j}]` 
                };
            }
        }
    }
    
    return { valid: true };
}
export function getLevelInfo(levelIndex) {
    const level = levels[levelIndex];
    if (!level) return null;
    
    const blockCount = level.map.reduce((count, row) => {
        return count + row.split('').filter(char => char !== ' ').length;
    }, 0);
    
    return {
        blockCount: blockCount,
        totalHP: level.map.reduce((count, row) => {
            return count + row.split('').filter(char => char !== ' ').reduce((sum, char) => {
                return sum + (blockType[char]?.hp || 0);
            }, 0);
        }, 0)
    };
}
