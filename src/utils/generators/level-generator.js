import CellularAutomata from './cellular-automata'
import RandomWalk from './random-walk'
import { connectionFields } from './connection-fields'

export default class GeneratorLevel {
    constructor(width, height, config) {
        this.width = width;
        this.height = height;
        this.autoC = config.cellularAutomata;
        this.walkC = config.randomWalk;
    }

    createMap() {
        let map = [];
        //1. Start RandomWalk
        const walker = new RandomWalk(this.width, this.height);
				let temp = [];
        temp = walker.createMap(this.walkC.maxTunnels, this.walkC.maxLength, this.walkC.minWidth, this.walkC.maxWidth);

        //2. Start cellular automata with initState from RandomWalk
        const automataOrder = new CellularAutomata(this.width, this.height, temp,
          this.autoC.chanceToStartAlive);
        map = automataOrder.createMap(3, this.autoC.deathLimit, this.autoC.birthLimit)

        //3. Union maps
        map = this.OR(map, temp);

        //4. Start wild cellular automata
        const automataWild = new CellularAutomata(this.width, this.height, undefined,
            this.autoC.chanceToStartAlive);
        temp = automataWild.createMap(3, 4, 5)
				
        //5. Union maps
        map = this.OR(map, temp);
				
				//6. Connect different fields
				let markedMap = connectionFields(map);
        
				//7. Enlarge map by 1
        map = this.enlarge(markedMap);

        return map;
    }
			
    OR(arr1, arr2) {
        let map = [];
        for (let x = 0; x < arr1.length; ++x) {
            map[x] = [];
            for (let y = 0; y < arr1[0].length; ++y) {
                map[x][y] = arr1[x][y] || arr2[x][y] || map[x][y] ? 1 : 0
                this.connect8neighbor(map, x, y);
            }
        }
        return map;
    }

    connect8neighbor(map, i, j) {
        if (i && j && map[i][j]) {
            //northwest
            if (map[i - 1][j - 1]) {
                map[i - 1][j] = 1;
                map[i][j - 1] = 1;
            }
            //northeast
            if (map[i + 1] && map[i + 1][j - 1]) {
                map[i][j - 1] = 1;
            }
        }
    }

    smooth(map) {
        for (let i = 1; i < map.length - 1; ++i)
            for (let j = 1; j < map[0].length - 1; ++j)
                if (map[i][j])
                    map[i][j] = map[i - 1][j] + map[i + 1][j] + map[i][j - 1] + map[i][j + 1] < 2 ? 0 : 1;
    }

    setNeighbors(map, x, y) {
        const dirs = [
            { x: -1, y: -1},
            { x: 0, y: -1},
            { x: 1, y: -1},
            { x: 1, y: 0},
            { x: 1, y: 1},
            { x: 0, y: 1},
            { x: -1, y: 1},
            { x: -1, y: 0}            
        ];
        for (const d of dirs) {
            const x2 = x + d.x;
            const y2 = y + d.y;
            if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) {
                continue;
            }
            if (map[x2][y2] === 0) {
                map[x2][y2] = 2;
            }
        }
        return map;
    }

    enlarge(map) {
        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                if (map[x][y] === 1) {
                    map[x][y] = 2;
                    map = this.setNeighbors(map, x, y);
                }
            }
        }

        for (let x = 0; x < this.width; ++x) {
            for (let y = 0; y < this.height; ++y) {
                if (map[x][y] > 1) {
                    map[x][y] = 1;
                }
            }
        }
        return map;
    }
}