import FillLevel from './fill-level';
import { config, digitToType } from './map-config';

// Dangeon
// const TILE_MAPPING = {
//     BLANK: 17,
//     WALL: {
//         TOP_LEFT: 3,
//         TOP_RIGHT: 5,
//         BOTTOM_RIGHT: 53,
//         BOTTOM_LEFT: 51,

//         TOP: 4,
//         LEFT: 18, //35, //18,
//         RIGHT: 16, // 37, //16,
//         BOTTOM: 52, // 1, //52,
//         INNER_TOP_LEFT: 0,
//         INNER_TOP_RIGHT: 2,
//         INNER_BOTTOM_LEFT: 32,
//         INNER_BOTTOM_RIGHT: 34,
//     },
//     FLOOR: 95
// };

// Crystal
const TILE_MAPPING = {
	BLANK: 13,
	WALL: {
		TOP_LEFT: [{ index: 180, weight: 9 }],
		TOP_RIGHT: [{ index: 181, weight: 9 }],
		BOTTOM_RIGHT: [{ index: 193, weight: 9 }],
		BOTTOM_LEFT: [{ index: 192, weight: 9 }],

		TOP: [{ index: 25, weight: 7 }, { index: 82, weight: 3 }],
		LEFT: [{ index: 14, weight: 7 }, { index: 71, weight: 3 }],
		RIGHT: [{ index: 12, weight: 7 }, { index: 69, weight: 3 }],
		BOTTOM: [{ index: 1, weight: 7 }, { index: 58, weight: 3 }],

		INNER_TOP_LEFT: [{ index: 0, weight: 9 }],
		INNER_TOP_RIGHT: [{ index: 2, weight: 9 }],
		INNER_BOTTOM_LEFT: [{ index: 24, weight: 9 }],
		INNER_BOTTOM_RIGHT: [{ index: 26, weight: 9 }],
	},
	FLOOR:
		[
			{ index: 16, weight: 9 },
			{ index: 47, weight: 1 },
			{ index: 45, weight: 1 },
			{ index: 46, weight: 1 }
		],
	JEWELRY_COLLISION: {
		STATUE_TOP: 272,
		STATUE_BOTTOM: 284,

		STATUE_DRAGON_TOP_LEFT: 273,
		STATUE_DRAGON_TOP_RIGHT: 274,
		STATUE_DRAGON_BOTTOM_LEFT: 285,
		STATUE_DRAGON_BOTTOM_RIGHT: 286,

		BIG_BONES_TOP_LEFT: 248,
		BIG_BONES_TOP_RIGHT: 249,
		BIG_BONES_BOTTOM_LEFT: 260,
		BIG_BONES_BOTTOM_RIGHT: 261,

		STONE: 213
	},

	JEWELRY_NONCOLLISION: {
		BONES: [
			{ index: 250, weight: 2 },
			{ index: 262, weight: 1 },
			{ index: 113, weight: 8 } //empty
		],
		CRACK: [
			{ index: 263, weight: 8 },
			{ index: 251, weight: 2 }
		],
		SMALL_STONE: [
			{ index: 176, weight: 3 },
			{ index: 177, weight: 3 },
			{ index: 178, weight: 3 },
			{ index: 179, weight: 3 },
			{ index: 200, weight: 3 },
			{ index: 201, weight: 3 },
			{ index: 202, weight: 3 },
			{ index: 203, weight: 3 },
			{ index: 113, weight: 7 } //empty
		]
	},

	INTERACTIVE_OBJECT: {
		POTION: 287,
		SCROLLS: 275,
		GOLD_HEAP: [
			{ index: 236, weight: 7 },
			{ index: 237, weight: 3 },
			{ index: 224, weight: 1 },
			{ index: 225, weight: 1 }
		],
		GOLD_INGOTS: [
			{ index: 226, weight: 7 },
			{ index: 227, weight: 7 },
			{ index: 238, weight: 1 },
			{ index: 239, weight: 1 }
		]
	}
};

export default class TileMapper {
	constructor(map, scene, width, height, tilesize) {
		this.width = width;
		this.height = height;
		this.scene = scene;
		this.map = map;
		this.tilesize = tilesize;
	}

	generateLevel() {
		this.scene.map = this.scene.make.tilemap({
			tileWidth: this.tilesize,
			tileHeight: this.tilesize,
			width: this.width,
			height: this.height
		});

		const tileset = this.scene.map.addTilesetImage("crystals", null, this.tilesize, this.tilesize);
		const floorLayer = this.scene.map.createBlankDynamicLayer("Floor", tileset);
		const groundLayer = this.scene.map.createBlankDynamicLayer("Ground", tileset);
		const collideObjectsLayer = this.scene.map.createBlankDynamicLayer("collideObjects", tileset);
		const upperObjectsLayer = this.scene.map.createBlankDynamicLayer("upperObjects", tileset);
		const upperFloorLayer = this.scene.map.createBlankDynamicLayer("upperFloor", tileset);

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const cell = this.map[x][y];
				if (cell === config.BLANK) {
					groundLayer.putTileAt(TILE_MAPPING.BLANK, x, y);
				} else {
					if (cell !== config.FLOOR) {
						const type = digitToType[cell];
						groundLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.WALL[type]);
						if(TILE_MAPPING.WALL[type] == TILE_MAPPING.WALL.INNER_TOP_LEFT){
							collideObjectsLayer.weightedRandomize(x,y,1,1,TILE_MAPPING.FLOOR);
							upperObjectsLayer.weightedRandomize(x,y,1,1,TILE_MAPPING.WALL.INNER_TOP_LEFT);
						}
					} else {
						floorLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.FLOOR);
						//JEWELRY
						this.putJewelry(x, y, upperFloorLayer, collideObjectsLayer, upperObjectsLayer);
					}
				}
			}
		}

		this.scene.groundLayer = groundLayer;
		this.scene.collideObjectsLayer = collideObjectsLayer;
		this.scene.upperObjectsLayer = upperObjectsLayer;
		this.scene.upperFloorLayer = upperFloorLayer;

		const levelFiller = new FillLevel(this, groundLayer, collideObjectsLayer, upperObjectsLayer);
		levelFiller.initGroups();
		levelFiller.setPlayer();
		this.setCamera(groundLayer, collideObjectsLayer, upperObjectsLayer);
		//levelFiller.spawnNpc();
		levelFiller.spawnMobs();
		levelFiller.addObjects();

		return { Ground: groundLayer, UpperFloor: upperFloorLayer, CollideObjects: collideObjectsLayer, UpperObjects: upperObjectsLayer };
	}

	setCamera(groundLayer, otherLayer, upperLayer) {
		const camera = this.scene.cameras.main;
		camera.setZoom(1.0);
		this.scene.physics.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels, true);
		camera.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
		camera.startFollow(this.scene.player);
		camera.roundPixels = true;

		groundLayer.setCollisionBetween(1, 500);
		otherLayer.setCollisionBetween(1, 500);
		otherLayer.setDepth(1);
		upperLayer.setDepth(10);
	}

	//----------

	putJewelry(x, y, upperFloorLayer, collideObjectsLayer, upperObjectsLayer) {
		if (this.dice20() < 4) {
			upperFloorLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.JEWELRY_NONCOLLISION[digitToType[110 + this.dice3()]])
		} else if (this.dice20() > 19) {
			switch (this.dice4()) {
				case 1:
					if (this.checkNxMFloor(4, 4, x, y, collideObjectsLayer)) {
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.BIG_BONES_TOP_LEFT, x - 1, y - 1);
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.BIG_BONES_TOP_RIGHT, x, y - 1);
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.BIG_BONES_BOTTOM_LEFT, x - 1, y);
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.BIG_BONES_BOTTOM_RIGHT, x, y);
					}
					break;
				case 2:
					if (this.checkNxMFloor(4, 4, x, y, collideObjectsLayer) || this.checkNx2Floor_Nx1Wall(4, x, y, collideObjectsLayer)) {
						upperObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.STATUE_DRAGON_TOP_LEFT, x - 1, y - 1);
						upperObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.STATUE_DRAGON_TOP_RIGHT, x, y - 1);
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.STATUE_DRAGON_BOTTOM_LEFT, x - 1, y);
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.STATUE_DRAGON_BOTTOM_RIGHT, x, y);
					}
					break;
				case 3:
					if (this.checkNxMFloor(3, 4, x, y, collideObjectsLayer) || this.checkNx2Floor_Nx1Wall(3, x, y, collideObjectsLayer)) {
						upperObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.STATUE_TOP, x, y - 1);
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.STATUE_BOTTOM, x, y);
					}
					break;
				case 4:
					if (this.checkNxMFloor(3, 3, x, y, collideObjectsLayer)) {
						collideObjectsLayer.putTileAt(TILE_MAPPING.JEWELRY_COLLISION.STONE, x, y);
					}
					break;
			}
		}
	}

	dice3() {
		return Phaser.Math.RND.between(1, 3);
	}

	dice4() {
		return Phaser.Math.RND.between(1, 4);
	}

	dice20() {
		return Phaser.Math.RND.between(1, 20);
	}

	//map & collideLayer
	checkNxMFloor(N, M, x, y, collideLayer) {
		for (let i = 2 - N; i < 2; ++i) {
			for (let j = 2 - M; j < 2; ++j) {
				if (!this.map[x + i] || this.map[x + i][y + j] !== config.FLOOR || collideLayer.getTileAt(x + i, y + j) !== null)
					return false;
			}
		}
		return true;
	}

	checkNx2Floor_Nx1Wall(N, x, y, collideLayer) {
		for (let i = 2 - N; i < 2; ++i) {
			if (!this.map[x + i] || this.map[x + i][y - 1] === config.FLOOR || this.map[x + i][y - 1] === config.BLANK || collideLayer.getTileAt(x + i, y - 1) !== null)
				return false;
		}
		for (let i = 2 - N; i < 2; ++i) {
			for (let j = 0; j < 2; ++j) {
				if (!this.map[x + i] || this.map[x + i][y + j] !== config.FLOOR || collideLayer.getTileAt(x + i, y + j) !== null)
					return false;
			}
		}
		return true;
	}
}