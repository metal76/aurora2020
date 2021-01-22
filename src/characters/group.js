export default class Group {
	constructor(objects) {
	  this.objects = objects;
	}

	join(object) {
		this.objects.push(object); 
	}

	expectedPosition(object) {
		const y = this.center.y;
		const expectedX = 10 * (this.objects.indexOf(object) + 20);
		return { x: expectedX, y };
	}

	get center() {
		const x = this.objects.reduce((memo, obj) => memo + obj.x, 0) / this.objects.length;
		const y = this.objects.reduce((memo, obj) => memo + obj.y, 0) / this.objects.length;

		return { x, y };
	}
}