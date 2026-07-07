import Ball from "./entities/Ball.js";
import Paddle from "./entities/Paddle.js";


export default class Game{
    #app;

    constructor(app){
        this.#app = app;

        const paddle = new Paddle();
        paddle.x = 340;
        paddle.y = 710;
        this.#app.stage.addChild(paddle);

        const ball = new Ball();
        ball.x = 400;
        ball.y = 700;
        this.#app.stage.addChild(ball);
    }
}