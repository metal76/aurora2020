//выбиратель из 2 вариантов
function addNewRuleToMatcher(matcher, from, to) {
	if (matcher[from] && matcher[from] != to) {
		const newFrom = Math.max(to, matcher[from]);
		const newTo = Math.min(to, matcher[from]);
		addNewRuleToMatcher(matcher, newFrom, newTo);
	}
	matcher[from] = to;
}

function connectionFields(map){
	// Marking
	let markedMap = marking(map);
	// Connection Fields
	makeConnection(markedMap.fieldMap, markedMap.fields);
	let orMap = OR(map, markedMap.fieldMap);
	// Get Max Field
	markedMap = marking(orMap);
	getMaxField(markedMap.fieldMap, markedMap.fields);
	return markedMap.fieldMap;
}

function marking(map) {
	let label = 1;
	let fl = false; 
	let result = [];
	let matcher = [];
	let fields = [];

	//Marking
	for (let i = 0; i < map.length; ++i) {
		result[i] = [];
		for (let j = 0; j < map[0].length; ++j) {
			switch (map[i][j]) {
				case 0:
					if (fl) {
						++label;
						fl = false;
					}
					result[i][j] = 0;
					break;

				default:
					fl = true;
					if (!i)
						result[i][j] = label;
					else {
						// check neighbors
						const top = result[i - 1][j];
						const left = !j ? 0 : result[i][j - 1];
						if (top == left) {
							result[i][j] = top ? top : label;
						}
						else if (!top || !left) {
							result[i][j] = Math.max(top, left);
						} else {
							let max = Math.max(top, left);
							let min = Math.min(top, left);
							result[i][j] = max;
							addNewRuleToMatcher(matcher, max, min);
						}
					}
					break;
			}
		}
		++label;
	}
	
	//Re-marking with matcher
	for (let i = 0; i < map.length; ++i) {
		for (let j = 0; j < map[0].length; ++j) {
			const item = result[i][j];
			if (item) {
				//Re-marking
				if (matcher[item]) {
					let m = matcher[item]
					while (matcher[m])
						m = matcher[m];
					result[i][j] = m;
				}
				//Count fields
				let field = fields[result[i][j]];
				if (!field) {
					fields[result[i][j]] = { left: i, right: i, top: j, bottom: j, pixels: 1, label: result[i][j]};
				} else {
					++field.pixels;
					field.left = Math.min(field.left, i);
					field.right = Math.max(field.right, i);
					field.top = Math.max(field.top, j);
					field.bottom = Math.min(field.bottom, j);
					fields[result[i][j]] = field;
				}
			}
		}
	}
	
	return {fieldMap: result, fields: fields};
}

function makeConnection(result, fields){
	for(let item = 0; item < fields.length; ++item){
		if(fields[item]){	
			let candidates = [ 
				nearFields(result, 0, fields[item].left, item),
				nearFields(result, 2, fields[item].right, item),
				nearFields(result, 1, fields[item].top, item),
				nearFields(result, 3, fields[item].bottom, item)
			];
				
			candidates = candidates.filter(it => it != undefined)
			if(candidates.length > 0){
				candidates.forEach(c => {
					switch (c.dir){
					case 0:
						for (let i = c.x; i < fields[item].left; ++i){
								result[i][c.y] = item;
							}
					break;
					case 2:
						for (let i = c.x; i > fields[item].right; --i){
							result[i][c.y] = item;
						}
					break;	
					case 1:
						for (let j = c.y; j < fields[item].top; ++j){
							result[c.x][j] = item;
						}
					break;
					case 3:
						for (let j = c.y; j > fields[item].bottom; --j){
							result[c.x][j] = item;
						}
					break;
					}
				})
			}
		}
	}
}
	
	//0 - left, 1 - top, 2 - right, 3 - bottom
function nearFields(map, direct, source, label){
	let sources = [];
	//Border cells
	switch(direct){
		case 0:
		case 2:
			for (let j = 0; j < map[0].length; ++j){
				if(map[source][j] == label)
					sources.push({x: source, y: j});
			}
		break;
		case 1:
		case 3:
			for (let i = 0; i < map.length; ++i){
				if(map[i][source] == label)
					sources.push({x: i, y: source});
			}
		break;
	}
		
	let candidates = [];
	for(let s = 0; s < sources.length; ++s){
		switch(direct){
			case 0:
				for (let i = source-1; i > -1; --i){
					if(map[i][sources[s].y]){
						candidates.push({x: i, y: sources[s].y, distance: source - i, dir: direct});
						break;
					}
				}
			break;
			case 2:
				for (let i = source+1; i < map.length; ++i){
					if(map[i][sources[s].y]){
						candidates.push({x: i, y: sources[s].y, distance: i - source, dir: direct});
						break;
					}
				}
			break;
			case 1:
				for (let j = source-1; j > -1; --j){
					if(map[sources[s].x][j]){
						candidates.push({x: sources[s].x, y: j, distance: source - j, dir: direct});
						break;
					}
				}
			break;
			case 3:
				for (let j = source+1; j < map[0].length; ++j){
					if(map[sources[s].x][j]){
						candidates.push({x: sources[s].x, y: j, distance: j - source, dir: direct});
						break;
					}
				}
			break;
		}	
	}
	candidates = candidates.filter(c => c.distance != 0);
	return candidates.length > 0 ? candidatesMin(candidates) : undefined;
}
	
function candidatesMin(arr){
	let cell = arr[0]
	for(let i = 1; i < arr.length; ++i){
		if(cell.distance < arr[i].distance)
			cell = arr[i];
	}
	return cell;
}

function getMaxField(map, fields){
	let maxField = fields.sort((a,b) => {
		return -1 * (a.pixels - b.pixels);
	})[0].label;
	
	for (let i = 0; i < map.length; ++i) {
		for (let j = 0; j < map[0].length; ++j){
			if(map[i][j] != maxField)
				map[i][j] = 0;
			else 
				map[i][j] = 1;
		}
	}
}

function OR(arr1, arr2) {
  let map = [];
  for (let x = 0; x < arr1.length; ++x) {
    map[x] = [];
    for (let y = 0; y < arr1[0].length; ++y) {
      map[x][y] = arr1[x][y] || arr2[x][y] || map[x][y] ? 1 : 0
    }
  }
  return map;
}

export { connectionFields }