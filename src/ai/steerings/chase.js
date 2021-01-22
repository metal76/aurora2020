import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class Chase extends Steering {
    constructor(owner, objects, force = 1, distance = 100) {
        super(owner, objects, force);
        this.distance = distance;
    }

    targetIsNear(target) {
        const dist = Math.sqrt(
            (this.owner.x - target.x) * (this.owner.x - target.x) +
            (this.owner.y - target.y) * (this.owner.y - target.y));

        return dist < this.distance;
    }

    calculateImpulse() {
        const target = this.objects[0];

        if (this.targetIsNear(target)) {
            const targetPos = new Vector2(target.x, target.y);

            // reached target
            if (Math.abs(targetPos.x - this.owner.x) < 35 && Math.abs(targetPos.y - this.owner.y) < 35) {
                return new Vector2(0, 0);
            }

            const desiredVelocity = new Vector2(targetPos.x - this.owner.x, targetPos.y - this.owner.y)
                .normalize()
                .scale(this.owner.maxSpeed);
            const curVelocity = new Vector2(this.owner.body.x - this.owner.body.prev.x, this.owner.body.y - this.owner.body.prev.y);
            return desiredVelocity.subtract(curVelocity);
        }
        return new Vector2(0, 0);
    }
}