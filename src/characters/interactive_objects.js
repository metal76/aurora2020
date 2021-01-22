export class Potion extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x+16, y+16, 'potion');
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setDepth(1);
        this.value = 70;
    }

    interact(target) {
        this.destroy();
        target.addHP(this.value);
    }
}

export class Scroll extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x+16, y+16, 'scrolls');
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setDepth(1);
        this.value = 30;
    }

    interact(target) {
        this.destroy();
        target.addHP(this.value);
    }
}

export class Gold extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x+16, y+16, 'gold');
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setDepth(1);
        this.value = 100;
    }

    interact(target) {
        this.destroy();
        target.addHP(this.value);
    }
}