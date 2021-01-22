import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class ChaseClosest extends Steering {
    constructor(owner, objects, minDist = null, force = 1) {
        super(owner, objects, force);
        this.minDist = minDist;
    }

    static calculateDistance(owner, object) {
        return Math.sqrt((owner.x - object.x) * (owner.x - object.x) + (owner.y - object.y) * (owner.y - object.y));
    }

    static findNearObject(owner, objects) {
        // let minDist = Number.MAX_SAFE_INTEGER;
        // бывает так, что нпс находит слайм в другом коридоре и начинает идти в стену
        let minDist = 1000;
        let obj = null;

        for (const o of objects) {
            const d = ChaseClosest.calculateDistance(owner, o);
            if (d < minDist) {
                minDist = d;
                obj = o;
            }
        }
        return obj;
    }

    calculateImpulse() {
        if (!this.owner.target) {
            if (this.objects.length === 0) {
                return new Vector2(0, 0);
            }

            const target = ChaseClosest.findNearObject(this.owner.body, this.objects);
            this.owner.target = target;
            if (target === null) {
                return new Vector2(0, 0);
            }
        }
        const targetPos = this.owner.target;

        // no min dist was set
        if (this.minDist === null) {
            const desiredVelocity = new Vector2(targetPos.x - this.owner.x, targetPos.y - this.owner.y)
                .normalize()
                .scale(this.owner.maxSpeed);
            const curVelocity = new Vector2(this.owner.body.x - this.owner.body.prev.x, this.owner.body.y - this.owner.body.prev.y);
            return desiredVelocity.subtract(curVelocity);
        }
        const distance = ChaseClosest.calculateDistance(this.owner, targetPos);

        let desiredVelocity = new Vector2(targetPos.x - this.owner.x, targetPos.y - this.owner.y)
        desiredVelocity.normalize().scale(this.owner.maxSpeed);
        if (distance > this.minDist) {
            return desiredVelocity;
        }

        if (distance <= this.minDist) {
            const newDesiredVelocity = new Vector2(-desiredVelocity.x, -desiredVelocity.y);
            newDesiredVelocity.normalize().scale(this.owner.maxSpeed);
            return newDesiredVelocity;
        }


    }
}