import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import { Body } from "matter";

export default class PatrollingUpDown extends Steering {

    constructor (owner,target,x,y, ownerSpeed= 50, force = 1) {
        super(owner, force);
        this.ownerSpeed = ownerSpeed;
        this.lastY = y;
        this.CurentY = y;
        this.lastY = y;
        this.currentDist = 0;
        this.maxDist = Phaser.Math.RND.between(8500, 31500 );
        this.direction = 1;
    }

    seek(maxSpeed) {
        const desiredVelocity = new Vector2(0, maxSpeed*(this.direction)).normalize().scale(maxSpeed);
        return desiredVelocity;
    }

    calculateImpulse ()
    {

        this.lastY = this.CurentY;
        const impulse =this.seek(this.ownerSpeed);
        this.CurentY += impulse.y ;       
        const dy =Math.abs( this.lastY - this.CurentY);
        this.currentDist += dy;
        if (this.currentDist>this.maxDist)
            {   this.direction = (this.direction)*(-1);
                this.currentDist = 0;
            };

            console.log(impulse.x,impulse.y ,this.direction);
        return impulse;
    }
}