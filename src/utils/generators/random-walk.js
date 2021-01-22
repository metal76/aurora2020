export default class RandomWalk {
    constructor(width, height) {
        this.directions = [
            Phaser.Math.Vector2.LEFT,
            Phaser.Math.Vector2.RIGHT,
            Phaser.Math.Vector2.UP,
            Phaser.Math.Vector2.DOWN
        ];

        this.width = width;
        this.height = height;
    }

    createArray(num) {
        let array = [];
        for (let i = 0; i < this.width; ++i) {
            array.push([]);
            for (let j = 0; j < this.height; ++j) {
                array[i].push(num);
            }
        }
        return array;
    }

    cannotContinueTunnel(pos, dir, w, h) {
        return ((pos.x === 0) && (dir.x === -1)) ||
            ((pos.y === 0) && (dir.y === -1)) ||
            ((pos.x === w - 1) && (dir.x === 1)) ||
            ((pos.y === h - 1) && (dir.y === 1));
    }

    getCoords(pos, dir, corridorWidth) {
        // moving vertically 
        if (dir.x !== 0) {
            let coords = [];

            if (pos.y + corridorWidth < this.height) {
                for (let i = 0; i < corridorWidth; ++i) {
                    coords.push(new Phaser.Math.Vector2(pos.x, pos.y + i));
                }
            } else {
                if (pos.y - corridorWidth > 0) {
                    for (let i = 0; i < corridorWidth; ++i) {
                        coords.push(new Phaser.Math.Vector2(pos.x, pos.y - i));
                    }
                }
            }

            return coords;
        }
        // moving horizontally
        else if (dir.y !== 0) {
            let coords = [];

            if (pos.x + corridorWidth < this.width) {
                for (let i = 0; i < corridorWidth; ++i) {
                    coords.push(new Phaser.Math.Vector2(pos.x + i, pos.y));
                }
            } else {
                if (pos.x - corridorWidth > 0) {
                    for (let i = 0; i < corridorWidth; ++i) {
                        coords.push(new Phaser.Math.Vector2(pos.x - i, pos.y));
                    }
                }
            }

            return coords;
        }
    }

    checkBounds(pos) {
        let shouldBreak = false;
        if (pos.x >= this.width) {
            pos.x = this.width - 1;
            shouldBreak = true;
        }
        if (pos.x < 0) {
            pos.x = 0;
            shouldBreak = true;
        }
        if (pos.y >= this.height) {
            pos.y = this.height - 1;
            shouldBreak = true;
        }
        if (pos.y < 0) {
            pos.y = 0;
            shouldBreak = true;
        }
        return shouldBreak;
    }

    createMap(maxTunnels, maxLength, minWidth, maxWidth) {
        let w = this.width;
        let h = this.height;
        let maxT = maxTunnels;
        let maxL = maxLength;
        let map = this.createArray(0, w, h);

        let curCoord = new Phaser.Math.Vector2(
            Phaser.Math.RND.between(0, h),
            Phaser.Math.RND.between(0, w)
        );

        let lastDir = {};
        let randomDir;

        while (maxT && maxL && w && h) {
            do {
                randomDir = Phaser.Math.RND.pick(this.directions);
            } while ((randomDir.x === -lastDir.x &&
                randomDir.y === -lastDir.y) ||
                (randomDir.x === lastDir.x &&
                    randomDir.y === lastDir.y));

            // build a tunnel
            let randomLength = Phaser.Math.RND.between(1, maxL);
            let randowWidth = Phaser.Math.RND.between(minWidth, maxWidth);
            let tunnelLength = 0;

            while (tunnelLength < randomLength) {
                if (this.cannotContinueTunnel(curCoord, randomDir, w, h)) {
                    break;
                }

                if (this.checkBounds(curCoord)) {
                    break;
                }

                const coords = this.getCoords(curCoord, randomDir, randowWidth);
                for (const coord of coords) {
                    map[coord.x][coord.y] = 1;
                }

                curCoord.x += randomDir.x;
                curCoord.y += randomDir.y;

                tunnelLength++;
            }

            if (tunnelLength > 0) {
                lastDir = randomDir;
                maxT -= 1;
            }
        }

        return map;
    }
}