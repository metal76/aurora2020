import Level from "./level.js";

const TILE_MAPPING = {
    BLANK: 17,
    FLOOR: 95
};

const LEVEL_TO_TILE = {
    0: TILE_MAPPING.BLANK,
    1: TILE_MAPPING.FLOOR,
}

export default function buildLevel(width, height, maxRooms, scene){
    let level = new Level(width, height, maxRooms);
    const rooms = level.generateLevel();
    const levelMatrix = level.levelMatrix;
    //console.log(levelMatrix);

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

    for(let y = 0; y < height; y++)
    {
        for(let x = 0; x < width; x++)
        {
            let index = levelMatrix[y][x];
            if(index === 0)
                outsideLayer.putTileAt(LEVEL_TO_TILE[index], x, y);
            else
                groundLayer.putTileAt(LEVEL_TO_TILE[index], x, y);
        }
    }

    //groundLayer.putTileAt(TILE_MAPPING.WALL.TOP, rooms[0].startCenter.x + 9, rooms[0].startCenter.y + 10);
   // console.log(width + " " + height);

    if (rooms.length != 0)
    {
        scene.player = scene.characterFactory.buildCharacter('aurora',
            rooms[0].startCenter.x * 32 + 10,
            rooms[0].startCenter.y * 32 + 10,
            {player: true});

        scene.physics.add.collider(scene.player, groundLayer);
        scene.physics.add.collider(scene.player, stuffLayer);
        scene.physics.add.collider(scene.player, outsideLayer);
        scene.gameObjects.push(scene.player);
    }

    const camera = scene.cameras.main;
    camera.setZoom(1.0)
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    camera.roundPixels = true;

    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    groundLayer.setCollisionBetween(1, 500);
    stuffLayer.setDepth(10);
    outsideLayer.setDepth(9999);
    outsideLayer.setCollisionBetween(1, 500);

    return {"Ground" : groundLayer, "Stuff" : stuffLayer, "Outside" : outsideLayer}
};