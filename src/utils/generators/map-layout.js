
import { config } from './map-config';

export default class MapLayout {
    constructor(map, width, height) {
        this.width = width;
        this.height = height;
        this.map = map;
    }

    getMapLayout() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.map[x][y] !== config.BLANK) {
                    let type = this.getCellType({ x, y });
                    type = this.checkBorders(x, y, type);
                    
                    this.map[x][y] = type;
                }
            }
        }
        return this.map;
    }

    checkBorders(x, y, type) {
        if (type === config.FLOOR) {
            // left side
            if (x === 0) {
                if (y === 0) {
                    // top left corner
                    type = config.WALL.TOP_LEFT;
                } else if (y === this.map[x].length - 1) {
                    // bottom left corner
                    type = config.WALL.BOTTOM_LEFT;
                } else {
                    // plain left wall
                    type = config.WALL.LEFT;
                }
            }
            // top side 
            else if (y === 0) {
                if (x === this.map.length - 1) {
                    // top right corner
                    type = config.WALL.TOP_RIGHT;
                } else {
                    // plain top wall
                    type = config.WALL.TOP;
                }
            } 
            // right side
            else if (x === this.map.length - 1) {
                if (y === this.map[x].length) {
                    // bottom right corner
                    type = config.WALL.BOTTOM_RIGHT;
                } else {
                    // plain right wall
                    type = config.WALL.RIGHT;
                }
            } 
            // bottom side
            else if (y === this.map[x].length - 1) {
                // plain bottom wall
                type = config.WALL.BOTTOM;
            }
        }
        return type;
    }

    getCell(x, y) {
        if (x < 0 || x >= this.map.length) {
            return null;
        }
        if (y < 0 || y >= this.map[x].length) {
            return null;
        }
        return this.map[x][y];
    }

    isBlank(cell) {
        return cell !== null && cell === config.BLANK;
    }

    isFilled(cell) {
        return cell !== null && cell !== config.BLANK;
    }

    getCellType(cellPos) {
        let neighbors = {};
        neighbors.topLeft = this.getCell(cellPos.x - 1, cellPos.y - 1);
        neighbors.top = this.getCell(cellPos.x, cellPos.y - 1);
        neighbors.topRight = this.getCell(cellPos.x + 1, cellPos.y - 1);
        neighbors.right = this.getCell(cellPos.x + 1, cellPos.y);
        neighbors.bottomRight = this.getCell(cellPos.x + 1, cellPos.y + 1);
        neighbors.bottom = this.getCell(cellPos.x, cellPos.y + 1);
        neighbors.bottomLeft = this.getCell(cellPos.x - 1, cellPos.y + 1);
        neighbors.left = this.getCell(cellPos.x - 1, cellPos.y);

        //#region OUTER CORNERS
        if (this.cellIsTopLeft(neighbors)) {
            return config.WALL.TOP_LEFT;
        }

        if (this.cellIsTopRight(neighbors)) {
            return config.WALL.TOP_RIGHT;
        }

        if (this.cellIsBottomLeft(neighbors)) {
            return config.WALL.BOTTOM_LEFT;
        }

        if (this.cellIsBottomRight(neighbors)) {
            return config.WALL.BOTTOM_RIGHT;
        }
        //#endregion

        //#region INNER CORNERS
        if (this.cellIsInnerTopLeft(neighbors)) {
            return config.WALL.INNER_TOP_LEFT;
        }

        if (this.cellIsInnerTopRight(neighbors)) {
            return config.WALL.INNER_TOP_RIGHT;
        }

        if (this.cellIsInnerBottomLeft(neighbors)) {
            return config.WALL.INNER_BOTTOM_LEFT;
        }

        if (this.cellIsInnerBottomRight(neighbors)) {
            return config.WALL.INNER_BOTTOM_RIGHT;
        }
        //#endregion

        //#region PLAIN SIDES
        if (this.cellIsTop(neighbors)) {
            return config.WALL.TOP;
        }

        if (this.cellIsLeft(neighbors)) {
            return config.WALL.LEFT;
        }

        if (this.cellIsRight(neighbors)) {
            return config.WALL.RIGHT;
        }

        if (this.cellIsBottom(neighbors)) {
            return config.WALL.BOTTOM;
        }
        //#endregion

        return config.FLOOR;
    }

    //#region PLAIN SIDES
    cellIsTop(cells) {
        // * * *
        // - - -
        return this.isBlank(cells.top) //&&
            // (this.isBlank(cells.topLeft) ||
            //     this.isBlank(cells.topRight));
    }

    cellIsLeft(cells) {
        // * -
        // * -
        // * -
        return this.isBlank(cells.left) //&&
            // (this.isBlank(cells.topLeft) ||
            //     this.isBlank(cells.bottomLeft));
    }

    cellIsRight(cells) {
        // - * 
        // - *
        // - * 
        return this.isBlank(cells.right) //&&
            // (this.isBlank(cells.topRight) ||
            //     this.isBlank(cells.bottomRight));
    }

    cellIsBottom(cells) {
        // - * 
        // - *
        // - * 
        return this.isBlank(cells.bottom) //&&
            // (this.isBlank(cells.bottomLeft) ||
            //     this.isBlank(cells.bottomRight));
    }
    //#endregion

    //#region OUTER CORNERS
    cellIsTopLeft(cells) {
        // * * *
        // * - -
        // * - -
        return this.isBlank(cells.top) &&
            // this.isBlank(cells.topLeft) &&
            this.isBlank(cells.left);
    }

    cellIsTopRight(cells) {
        // * * *
        // - - *
        // - - *
        return this.isBlank(cells.top) &&
            // this.isBlank(cells.topRight) &&
            this.isBlank(cells.right);
    }

    cellIsBottomLeft(cells) {
        // * - -
        // * - -
        // * * *
        // return false;
        return this.isBlank(cells.bottom) &&
            // this.isBlank(cells.bottomLeft) &&
            this.isBlank(cells.left);
    }

    cellIsBottomRight(cells) {
        // - - *
        // - - *
        // * * *
        // return false;
        return this.isBlank(cells.bottom) &&
            // this.isBlank(cells.bottomRight) &&
            this.isBlank(cells.right);
    }
    //#endregion

    //#region INNER CORNERS
    cellIsInnerTopLeft(cells) {
        // - - -
        // - * *
        // - * *
        // return false;
        return this.isBlank(cells.bottomRight) &&
            this.isFilled(cells.bottom) &&
            this.isFilled(cells.right);
    }

    cellIsInnerTopRight(cells) {
        // - - -
        // * * -
        // * * -
        // return false;
        return this.isBlank(cells.bottomLeft) &&
            this.isFilled(cells.bottom) &&
            this.isFilled(cells.left);
    }

    cellIsInnerBottomLeft(cells) {
        // - * *
        // - * *
        // - - -
        // return false;
        return this.isBlank(cells.topRight) &&
            this.isFilled(cells.top) &&
            this.isFilled(cells.right);
    }

    cellIsInnerBottomRight(cells) {
        // * * -
        // * * -
        // - - -
        // return false;
        return this.isBlank(cells.topLeft) &&
            this.isFilled(cells.top) &&
            this.isFilled(cells.left);
    }
    //#endregion
}