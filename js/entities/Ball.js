import { Container, Graphics, Sprite } from "../pixi.mjs";

export default class Ball extends Container{
    constructor(texture){
        super();

        this.radius = 5;

        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.width = this.radius * 2;
        sprite.height = this.radius * 2
        this.addChild(sprite);

        this.baseSpeed = 3;
        this.speedMultiplier = 1;
        this.vx = 1;
        this.vy = -1;
        this.isLaunch = false;
    } 
    get speed() {
        return this.baseSpeed * this.speedMultiplier;
    }
    launch() {
        this.isLaunch = true;
    }
    update(canvasWidth, canvasHeight) {
        if (!this.isLaunch) return;

        const speed = this.speed
        const margin = 160;

        this.x += speed * this.vx;
        this.y += speed * this.vy;

        if (this.x < margin) {
            this.x = margin;
            this.vx = Math.abs(this.vx); 
        }
        if (this.x > canvasWidth - margin) {
            this.x = canvasWidth - margin;
            this.vx = -Math.abs(this.vx); 
        }
        if (this.y < this.radius) {
            this.y = this.radius;
            this.vy = -this.vy;
        }

        if (this.y > canvasHeight) {
            this.isLaunch = false;
            return 'ball_fell'
        }
    }
}