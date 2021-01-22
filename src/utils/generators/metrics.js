//import { marking } from './marking'

function fillability(map){
	let cntBack = 0;
	let cntLevel = 0;
	for(let x = 0; x < map.length; ++x){
		for(let y = 0; y < map[0].length; ++y){
			if(map[x][y]) ++cntLevel;
			else ++cntBack;
		}
	}
	return cntLevel / cntBack;
}

function info(map){
	//return count of fields in map
	//const info = marking(map);
	//console.log("connectivity (count fields): " + info.length);
	
	//console.log("count pixels of field: " + info[0].pixels);
	
	//console.log("width: "+ (info[0].right - info[0].left) + " height: " + (info[0].top - info[0].bottom));
	
}

export { fillability, info };