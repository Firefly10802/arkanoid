import { Container, Graphics } from "../pixi.mjs";

export default class Ball extends Container{
    constructor(){
        super();

        this.radius = 5;

        const view = new Graphics();
        view.setStrokeStyle({ width: 2, color: 0xff0000});
        view.circle(0,0,this.radius);
        view.stroke();
        this.addChild(view);

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