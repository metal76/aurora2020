export default class Mine extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        scene.mines.add(this);
        this.lifeTime = 5000;
        this.dangerZone = 60;
        this.createdAt = scene.time.now;
    }

    get beeps() {
        return this.scene.time.now - this.createdAt < this.lifeTime;
    }

    get explodes() {
        let time = this.scene.time.now - this.createdAt;
        return time > this.lifeTime && time < this.lifeTime + 2500;
    }

    update() {     
        if (this.beeps || this.explodes) {
            this.updateAnimation();
        } else {
            this.destroy();
        }
    }

    updateAnimation() {
        const animsController = this.anims;
        if (this.beeps) {
            animsController.play(this.animations[0], true);
        } else if (this.explodes) {
            animsController.play(this.animations[1], true);
        }
    }
}
