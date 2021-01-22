import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class RanawayFromObjects extends Steering {
    constructor(owner, objects, force = 1) {
        super(owner, objects, force);
    }

    static calculateDistance(owner, object) {
        return Math.sqrt((owner.x - object.x)*(owner.x - object.x) + (owner.y - object.y)*(owner.y - object.y));
    }

    static isNear(owner, object, margin = 0) {
        const d = RanawayFromObjects.calculateDistance(owner, object);
        return d < object.dangerZone + margin;
    }

    static findNearObjects(owner, object) {
        let nearest = [];
        
        for (const m of object) {
            if (RanawayFromObjects.isNear(owner, m, 50)) {
                nearest.push(m);
            }
        }
        return nearest;
    }

    calculateImpulse() {
        if (this.objects.length === 0) {
            return new Vector2(0, 0);
        }
        const nearestObjects = RanawayFromObjects.findNearObjects(this.owner.body, this.objects);
        if (nearestObjects.length === 0) {
            return new Vector2(0, 0);
        }
        let desiredVelocity = new Vector2(0,0);
        for (const m of nearestObjects) {
            desiredVelocity.add(new Vector2(this.owner.body.x - m.x, this.owner.body.y - m.y));
        }
        desiredVelocity.normalize().scale(this.owner.maxSpeed);

        const curVelocity = new Vector2(
            this.owner.body.x - this.owner.body.prev.x, 
            this.owner.body.y - this.owner.body.prev.y);

        return desiredVelocity.subtract(curVelocity);
    }
}