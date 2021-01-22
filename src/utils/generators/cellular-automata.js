export default class CellularAutomata {
	constructor(width, height, state,  chanceToStartAlive = 0.45){
		this.height = height;
		this.width = width;
		if(state)
			this.cellmap = state;
		else{
			//initState
			this.cellmap = [];
			for(let x = 0; x < this.width; ++x){
				this.cellmap[x] = [];
				for(let y = 0; y < this.height; ++y)
					this.cellmap[x][y] = Phaser.Math.RND.frac() <= chanceToStartAlive;
			}
		}
	}
	
	countAliveNeighbours(x,y){
		let count = 0;
		for(let i = -1; i < 2; ++i)
			for(let j = -1; j < 2; ++j){
				if(!i && !j)
					continue;
				let nX = x+i;
				let nY = y+j;
			
				if(nX < 0 || nY < 0|| nX >= this.width || nY >= this.height){
					//++count;
				}
				else if(this.cellmap[nX][nY])
					++count;
			}
		return count;
	}
	
	doIter(deathLimit, birthLimit){
		let map = [];
		for(let x = 0; x < this.width; ++x){
			map[x] = [];
			for(let y = 0; y < this.height; ++y){
				const nbs = this.countAliveNeighbours(x,y);
				map[x][y] = this.cellmap[x][y] ? !(nbs < deathLimit) : nbs > birthLimit;
				map[x][y] = map[x][y] ? 1 : 0;
			}
		}
		this.cellmap = map;
	}
	
	createMap(step, deathLimit, birthLimit){
		for(let i = 0; i < step; ++i)
			this.doIter(deathLimit, birthLimit);
		return this.cellmap;
	}
}