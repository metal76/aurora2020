import Level from "./level-generator.js";
import Exploring from "../ai/steerings/exploring";

const TILE_MAPPING = {
    BLANK: 17,
    FLOOR: [{index: 95, weight: 8}, {index: 172, weight: 2}],
};
const LEVEL_TO_TILE = {
    0: TILE_MAPPING.BLANK,
    1: TILE_MAPPING.FLOOR
}

export default function buildLevel(width, height, maxRooms, scene){
    let level = new Level(width, height, maxRooms); 
    const rooms = level.generateLevel();
    const levelMatrix = level.levelMatrix;
    serialize(level);
    level = unserialize(level);
    console.log(level);
    // Creating a blank tilemap with dimensions matching the dungeon
    const tilesize = 32;
    scene.map = scene.make.tilemap({
        tileWidth: tilesize,
        tileHeight: tilesize,
        width: width,
        height: height
    });

    const tileset = scene.map.addTilesetImage("tiles", null, tilesize, tilesize);
    const outsideLayer = scene.map.createBlankDynamicLayer("Water", tileset);
    const groundLayer = scene.map.createBlankDynamicLayer("Ground", tileset);
    const stuffLayer = scene.map.createBlankDynamicLayer("Stuff", tileset);

    // ground tiles mapping
    for(let y = 0; y < height; y++)
        for(let x = 0; x < width; x++)
        {
            let index = levelMatrix[y][x];
            if(index === 0)
                outsideLayer.putTileAt(LEVEL_TO_TILE[index], x, y);
            else 
                groundLayer.weightedRandomize(x, y, 1, 1, LEVEL_TO_TILE[index]);
        }

    if (rooms.length != 0)
    {
        scene.player = scene.characterFactory.buildCharacter('aurora', 
                                                             rooms[0].startCenter.x * 32 + 10, 
                                                             rooms[0].startCenter.y * 32 + 10, 
                                                             {player: true});
        // Watch the player and tilemap layers for collisions, for the duration of the scene:
        scene.physics.add.collider(scene.player, groundLayer);
        scene.physics.add.collider(scene.player, stuffLayer);
        scene.physics.add.collider(scene.player, outsideLayer);
        scene.gameObjects.push(scene.player);
    }


    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = scene.cameras.main;
    camera.setZoom(1.0)
    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.roundPixels = true;
    camera.startFollow(scene.player);
    
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    groundLayer.setCollisionBetween(1, 500);
    stuffLayer.setDepth(10);
    outsideLayer.setDepth(9999);
    outsideLayer.setCollisionBetween(1, 500);

    return {"Ground" : groundLayer, "Stuff" : stuffLayer, "Outside" : outsideLayer}
};

function serialize(instance) {
    var str = JSON.stringify(instance);
    sessionStorage.setItem("json", str);
}

function unserialize() {
    var instance = new Level();                  
    var serializedObject = JSON.parse(sessionStorage.getItem("json"));
    Object.assign(instance, serializedObject);
    return instance;
}
