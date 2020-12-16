import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import { Body } from "matter";

export default class PatrollingLeftRight extends Steering {

    constructor (owner, ownerSpeed= 80, force = 1) {
        super(owner, force);
        this.ownerSpeed = ownerSpeed;
        this.lastX = owner.x;
        this.currentDist = 0;
        this.maxDist = Phaser.Math.RND.between(50, 150 );
        this.direction = 1;
    }

    seek(owner, maxSpeed) {
        const desiredVelocity = new Vector2(owner.x+maxSpeed*(this.direction), 0)
            .normalize().scale(maxSpeed);
            console.log(this.direction,owner.body.x,maxSpeed)
        return desiredVelocity;
    }

    calculateImpulse (currentBody)
    {
        
        let pursuitMen;
        pursuitMen = this.owner;
            const dx =Math.abs( this.lastX - pursuitMen.x);
            this.currentDist += dx;
            if ((dx < 2)||(this.currentDist>this.maxDist))
            {   this.derection *= -1;
                this.currentDist = 0;
            };
            this.lastX = pursuitMen.x;

        return this.seek(pursuitMen, this.ownerSpeed);
    }
}