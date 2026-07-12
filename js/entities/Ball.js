import { Container, Graphics } from "../pixi.mjs";

export default class Ball extends Container{
    constructor(){
        super();

        const view = new Graphics();
        view.setStrokeStyle({ width: 2, color: 0xff0000});
        view.circle(0,0,5);
        view.stroke();
        this.addChild(view);

        this.vx = 5;
        this.vy = -5;
        this.isLaunch = false;
    } 

    launch() {
        this.isLaunch = true;
    }
    update(canvasWidth, canvasHeight) {
        if (!this.isLaunch) return;
        
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0) this.vy *= -1;

        if (this.y > canvasHeight) {
            this.isLaunch = false;
            return 'ball_fell'
        }
    }
}