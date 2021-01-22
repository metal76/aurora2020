import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Union extends Steering {
	constructor(owner, group, index, force = 1, ownerSpeed = 50) {
		super(owner, group, index, [], force);
		this.owner = owner;
		this.group = group;
		this.index = index;
		this.ownerSpeed = ownerSpeed;
	}

	calculateImpulse () {
		const { x, y } = this.group.expectedPosition(this.owner.gameObjects[this.index]);
		const eps = 1;
		if (Math.abs(this.owner.gameObjects[this.index].y - y) <= 0 && Math.abs(object.x - x) <= 0) {
			return { x: 0, y: 0 };
		}
		let nextY = this.owner.gameObjects[this.index].y < y ? y : -y;
		nextY = Math.abs(this.owner.gameObjects[this.index].y - y) < eps ? 0 : nextY;
		let nextX = this.owner.gameObjects[this.index].x < x ? x : -x;
		nextX = Math.abs(this.owner.gameObjects[this.index].x - x) < eps ? 0 : nextX;
		const nextDirection = new Vector2({ x: nextX, y: nextY });
		nextDirection.normalize().scale(this.ownerSpeed);

		return nextDirection;
	}
}
