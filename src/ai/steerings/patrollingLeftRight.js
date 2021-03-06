import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import { Body } from "matter";

export default class PatrollingLeftRight extends Steering {

    constructor (owner,target,x,y, ownerSpeed= 50, force = 1) {
        super(owner, force);
        this.ownerSpeed = ownerSpeed;
        this.lastX = x;
        this.CurentX = x;
        this.lastY = y;
        this.currentDist = 0;
        this.maxDist = Phaser.Math.RND.between(8500, 31500 );
        this.direction = 1;
    }

    seek(maxSpeed) {
        const desiredVelocity = new Vector2( maxSpeed*(this.direction), 0).normalize().scale(maxSpeed);
        return desiredVelocity;
    }

    calculateImpulse ()
    {

        this.lastX = this.CurentX;
        const impulse =this.seek(this.ownerSpeed);
        this.CurentX += impulse.x ;       
        const dx =Math.abs( this.lastX - this.CurentX);
        this.currentDist += dx;
        if (this.currentDist>this.maxDist)
            {   this.direction = (this.direction)*(-1);
                this.currentDist = 0;
            };

            console.log(impulse.x,impulse.y ,this.direction);
        return impulse;
    }
}