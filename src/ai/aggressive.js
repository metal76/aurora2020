import {StateTable, StateTableRow} from './behaviour/state'
import Pursuit from "./steerings/pursuit";
import Chase from "./steerings/chase";
import Exploring from "./steerings/exploring";

export default class Aggressive{
    constructor(owner, targets) {

        this.table = new StateTable({
            me: owner,
            targets: targets,
            selectedEnemy: null,
            distance: 200,
            timer: 0
        });

        this.table.addState(new StateTableRow('idle',
            this.enemyNear,
            'attack',
            this.onStartAttack));
        this.table.addState(new StateTableRow('research',
            this.enemyNear,
            'attack',
            this.onStartAttack));
        this.table.addState(new StateTableRow('attack',
            this.enemyFar,
            'idle',
            this.onStopAttack));
        this.table.addState(new StateTableRow('idle',
            this.waitedEnough,
            'research',
            this.onStartResearch));
    }
    update(state){
      this.table.context.timer += 1;
      return this.table.getNextState(state);
    }

    enemyNear() {
        const context = this;
        return this.targets.some(x =>
            x.body.position.distance(context.me.body.position) <= context.distance);

    }

    gotEnemy() {

    }

    enemyFar() {
        const context = this;
        return this.targets.every(x =>
            x.body.position.distance(context.me.body.position) > context.distance);
    }

    onStartAttack() {
        const context = this;
        const target = context.targets.find(x =>
            x.body.position.distance(context.me.body.position) < context.distance)
        context.me.maxSpeed = 10;
        context.me.steering = new Chase(context.me, [target], 1, context.distance);
        this.timer = 0;
    }

    onStopAttack() {
        this.me.steering = null//new Exploring(this.me, 1, 20);
        this.timer = 0;
    }

    waitedEnough() {
       return this.timer > 120;
    }

    onStartResearch() {
        this.me.steering = new Exploring(this.me, 1, 20);
        this.timer = 0;
    }
}
