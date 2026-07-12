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
        this.x += speed * this.vx;
        this.y += speed * this.vy;

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0) this.vy *= -1;

        if (this.y > canvasHeight) {
            this.isLaunch = false;
            return 'ball_fell'
        }
    }
}