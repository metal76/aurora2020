import Vector2 from 'phaser/src/math/Vector2'

export default class Level{
    constructor(width, height, roomsCount, minRoomWidth = 5, maxRoomWidth = 9,
                minRoomHeight = 5, maxRoomHeight = 9, pathWidth = 3, maxPaths = 2){
        this.width = width;
        this.height = height;
        this.roomsCount = roomsCount;
        this.minRoomWidth = minRoomWidth;
        this.maxRoomWidth = maxRoomWidth;
        this.minRoomHeight = minRoomHeight;
        this.maxRoomHeight = maxRoomHeight;
        this.maxPaths = maxPaths;
    }

    generateLevel(){
        this.levelMatrix = [];
        for(let y = 0; y < this.height; y++){
            let col = [];
            for (let x = 0; x < this.width; x++)
                col.push(0);
            this.levelMatrix.push(col);
        }
        const startCenters = [];
        this.quadTreeDropPoints(startCenters, this.roomsCount, 0, this.width-1, 0, this.height-1);
        let rooms = this.makeRoomsDescriptors(startCenters);
        this.placeRooms(rooms);
        rooms = rooms.filter(r => r.square > 1);
        this.paveTheWays(rooms);
        this.rooms = rooms;
        return rooms;
    }

    placeRooms(rooms){
        for(let i = 0; i < rooms.length; i++){
            const room = rooms[i];
            let width = Phaser.Math.RND.integerInRange(this.minRoomWidth, this.maxRoomWidth);
            let height = Phaser.Math.RND.integerInRange(this.minRoomHeight, this.maxRoomHeight);

            width += width%2 === 0? 1 : 0;
            height += height%2 === 0? 1 : 0;


            let dx = room.startCenter - Math.floor(width/2);
            if(dx < 0)
                room.startCenter.subtract(new Vector2(dx, 0));
            else dx = room.startCenter + Math.floor(width/2)
            if(dx > 0)
                room.startCenter.subtract(new Vector2(dx, 0));

            let dy = room.startCenter - Math.floor(height/2);
            if(dy < 0)
                room.startCenter.subtract(new Vector2(0, dy));
            else dy = room.startCenter + Math.floor(height/2)
            if(dy > 0)
                room.startCenter.subtract(new Vector2(0, dy))

            room.left = room.startCenter.x - Math.floor(width/2);
            room.right = room.startCenter.x + Math.floor(width/2);
            room.top = room.startCenter.y - Math.floor(height/2);
            room.down = room.startCenter.y + Math.floor(height/2);


            let sum = 0;
            if(room.top > 0 && room.left > 0 && room.down < this.height && room.right < this.width)
                for(let y = room.top; y <= room.down; y++)
                    for(let x = room.left; x <= room.right; x++)
                        if(this.levelMatrix[y][x] === 0)
                            sum++;
            if(sum === width * height){
                for(let y = room.top; y <= room.down; y++)
                    for(let x = room.left; x <= room.right; x++)
                        this.levelMatrix[y][x] = 1;
                room.square = sum;
            }
        }
    }

    paveTheWays(rooms){
        for(let i = 0; i < rooms.length - 1; i++){
            for(let j = i+1; j < rooms.length; j++){
                rooms[i].neighbours.push({
                    idx: j,
                    id:rooms[j].id,
                    dist : rooms[i].startCenter.distance(rooms[j].startCenter)})
            }
            rooms[i].neighbours = rooms[i].neighbours.sort(this.distComparer);
            for(let n = 0; n < Phaser.Math.RND.integerInRange(1, Math.min(rooms[i].neighbours.length, this.maxPaths)); n++)
            {
                this.paveWay(rooms[i].startCenter, rooms[rooms[i].neighbours[n].idx].startCenter)
            }
        }
    }

    distComparer(neighbour1, neighbour2){
        const d1 = neighbour1.dist;
        const d2 = neighbour2.dist;
        if(d1 > d2) return 1
        if(d2 > d1) return -1
        return 0
    }

    paveWay(center1, center2){
        let y, y1, x, x1,
            dx = center1.x >= center2.x ? 1 : -1,
            dy = center1.y >= center2.y ? 1 : -1;
        y1= center1.y;
        y = center2.y;
        x1 = center1.x;
        x = center2.x;
        while (x != x1){
            if(this.levelMatrix[y][x] === 0){
                if(y-1 >= 0)
                    this.levelMatrix[y-1][x] = 1;
                this.levelMatrix[y][x] = 1;
                if(y+1 < this.height)
                    this.levelMatrix[y+1][x] = 1;
            }
            x+= dx;
        }
        while(y != y1){
            if(this.levelMatrix[y][x1] === 0){
                if(x1-1 >= 0)
                    this.levelMatrix[y][x1-1] = 1;
                this.levelMatrix[y][x1] = 1;
                if(x1+1 < this.width)
                    this.levelMatrix[y][x1+1] = 1;
            }
            y += dy;
        }
    }

    makeRoomsDescriptors(startCenters){
        const descriptors = [];
        startCenters.forEach(c => {
            descriptors.push({
                startCenter: c,
                left: c.x,
                right: c.x,
                top: c.y,
                down: c.y,
                id: this.levelMatrix[c.y][c.x],
                square: 1,
                neighbours: [], // stores id's of neighbours and distances between centers to them
                width : function() {
                    return this.right - this.left + 1
                },
                height : function() {
                    return this.down - this.top + 1
                }
            })
            this.levelMatrix[c.y][c.x] = 0;
        })
        return descriptors;
    }

    getQuadrantsNums(totalNum, left, right, top, down, xCenter, yCenter){
        const quadrantsMax = [
            (xCenter-left+1) * (yCenter-top+1),
            (right-xCenter) * (yCenter-top+1),
            (xCenter-left+1) * (down-yCenter),
            (right-xCenter) * (down-yCenter)
        ];

        if(totalNum > (right-left+1) * (down-top+1) )
            return quadrantsMax;

        const quarter = Math.floor(totalNum / 4);
        const quadrants = [];
        for(let i = 0; i < 4; i++)
            quadrants.push(quarter);
        let rest = totalNum - quarter * 4;

        let startQuadrant = Phaser.Math.RND.integerInRange(0, 4);

        while(rest > 0){
            quadrants[(startQuadrant + rest)%4] ++;
            rest--;
        }
        return quadrants;
    }


    quadTreeDropPoints(points, number, left, right, top, down){
        if(number === 0) return;
        if (number === 1){
            let x = 0, y = 0;
            let alreadyAdded = true;
            while(alreadyAdded) {
                x = Phaser.Math.RND.integerInRange(left, right);
                y = Phaser.Math.RND.integerInRange(top, down);
                if(this.levelMatrix[y][x] < 1)
                    alreadyAdded = false;
            }
            points.push(new Vector2(x, y));
            this.levelMatrix[y][x] = points.length;
        } else {
            const xCenter = Math.floor((right + left) / 2);
            const yCenter = Math.floor((down + top) / 2);
            const quadrants = this.getQuadrantsNums(number, left, right, top, down, xCenter, yCenter);
            this.quadTreeDropPoints(points, quadrants[0], left, xCenter, top, yCenter);
            this.quadTreeDropPoints(points, quadrants[1], xCenter+1, right, top, yCenter);
            this.quadTreeDropPoints(points, quadrants[2], left, xCenter, yCenter+1, down);
            this.quadTreeDropPoints(points, quadrants[3], xCenter+1, right, yCenter+1, down);
        }
    }
}
