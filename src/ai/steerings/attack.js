import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class Attack extends Steering {
    constructor(owner, target, force = 1) {
        super(owner, [target], force);
        this.lastTimeAttacked = 0;
    }

    calculateImpulse() {
        if (this.objects.length > 0) {
            const target = this.objects[0];
            this.owner.attack(target);        
        }
        return new Vector2(0,0);
    }
}