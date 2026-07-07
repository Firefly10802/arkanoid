import Ball from "./entities/Ball.js";
import Paddle from "./entities/Paddle.js";


export default class Game{
    #app;

    constructor(app){
        this.#app = app;

        this.paddle = new Paddle();
        this.paddle.x = 340;
        this.paddle.y = 710;
        this.#app.stage.addChild(this.paddle);

        this.ball = new Ball();
        this.ball.x = 400;
        this.ball.y = 700;
        this.#app.stage.addChild(this.ball);

        this.setupControls();
        this.startLoop();
    }

    setupControls() {
        const keys = { left: false, right: false };
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') keys.left = true;
            if (e.key === 'ArrowRight') keys.right = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') keys.left = false;
            if (e.key === 'ArrowRight') keys.right = false;
        });

        this.#app.ticker.add(() => {
            if (keys.left) this.paddle.x -= 8;
            if (keys.right) this.paddle.x += 8;

            if (this.paddle.x < 0) this.paddle.x = 0;
            if (this.paddle.x > this.#app.screen.width - 120) {
                this.paddle.x = this.#app.screen.width - 120;
            };
        })
    }
    
    startLoop() {
        this.#app.ticker.add(() => {
            this.ball.update(this.#app.screen.width, this.#app.screen.height);
            this.checkCollisions();
        })
    }

    checkCollisions() {
        const ball = this.ball;
        const paddle = this.paddle;

        if (
            ball.x + 10 > paddle.x &&
            ball.x - 10 < paddle.x + 120 &&
            ball.y + 10 > paddle.y &&
            ball.y - 10 < paddle.y + 10
        ) {
            const hitPos = (ball.x - (paddle.x + 60)) / 60;
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

            ball.vx = hitPos * speed * 0.8;
            ball.vy = -Math.abs(ball.vy)

            ball.y = paddle.y - 15;
        }
    }
}