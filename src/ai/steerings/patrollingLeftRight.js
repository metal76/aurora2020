import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class PatrollingLeftRight extends Steering {

    constructor (owner, ownerSpeed= 80, force = 1) {
        super(owner, force);
        this.ownerSpeed = ownerSpeed;
        this.last.x = owner.x;
        currentDist = 0;
        maxDist = Phaser.Math.RND.between(50, 150 );
        derection = 1;
        started = false;
    }

    seek(owner, maxSpeed) {
        const desiredVelocity = new Vector2(owner.x+maxSpeed*this.derection, 0)
            .normalize().scale(maxSpeed);
        return desiredVelocity;
    }

    calculateImpulse (currentBody)
    {
        
        let pursuitMen;
        pursuitMen = this.owner;
            started= true;
            dx =Math.abs( this.last.x - pursuitMen.x);
            this.currentDist += dx;
            if ((dx < 2)||(this.currentDist>this.maxDist))
            {   this.derection *= -1;
                this.currentDist = 0;
            };
            this.last.x = pursuitMen.x;   

        return this.seek(pursuitMen, this.ownerSpeed);
    }
}