import Ball from "./entities/Ball.js";
import Block from "./entities/Block.js";
import Paddle from "./entities/Paddle.js";
import { hitRectangle } from "./utils.js";

export default class Game {
    #app;

    constructor(app) {
        this.#app = app;

        this.paddle = new Paddle();
        this.paddle.x = 340;
        this.paddle.y = 710;
        this.#app.stage.addChild(this.paddle);

        this.ball = new Ball();
        this.ball.x = 400;
        this.ball.y = 700;
        this.#app.stage.addChild(this.ball);

        this.blocks = this.createBlock();

        this.setupControls();
        this.startLoop();
    }
    createBlock () {
        const blocks = [];
        const cols = 10;
        const rows = 6;
        const height = 25;
        const width = 60;
        const padding = 3;
        const offsetX = (this.#app.screen.width - (cols * (width + padding) - padding)) / 2;
        const offsetY = 50;
        const colors = [0xD7C74C, 0x409692, 0xF765AA, 0x74C25E, 0xFFA89F, 0xC7BCB9];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * (width + padding);
                const y = offsetY + row * (height + padding);
                const color = colors[row % colors.length];

                const block = new Block(x, y, width, height, color);
                blocks.push(block);
                this.#app.stage.addChild(block);
            }
        }

        return blocks;
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
            if (this.paddle.x > this.#app.screen.width - this.paddle.width) {
                this.paddle.x = this.#app.screen.width - this.paddle.width;
            }
        });
    }

    startLoop() {
        this.#app.ticker.add(() => {
            this.ball.update(this.#app.screen.width, this.#app.screen.height);
            this.checkCollisions();
            this.checkBlockCollision();
        });
    }

    checkCollisions() {
        const ball = this.ball;
        const paddle = this.paddle;

        if (hitRectangle(this.ball, this.paddle)) {
            const hitPos = (ball.x - (paddle.x + 30)) / 30;
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

            ball.vx = hitPos * speed * 0.5;
            ball.vy = -Math.abs(ball.vy)

            ball.y = paddle.y - 15;
        }
    }

    checkBlockCollision(){
        const ball = this.ball;
        const steps = 5;

        for (let step = 0; step < steps; step++) {
            const fraction = (step + 1) / steps;
            const checkX = ball.x + ball.vx * fraction;
            const checkY = ball.y + ball.vy * fraction;

            const tempBall = {
                x: checkX,
                y: checkY,
                width: 10,
                height: 10,
                radius: 5
            };

            for (let i = 0; i < this.blocks.length; i++) {
                const block = this.blocks[i];
                if (!block.isAlive) continue;

                if (hitRectangle(tempBall, block)) {
                    const overlapX = Math.min(
                        checkX + 5 - block.x,
                        block.x + block.width - (checkX - 5)
                    );
                    const overlapY = Math.min(
                        checkY + 5 - block.y,
                        block.y + block.height - (checkY - 5)
                    );

                    if (overlapX < overlapY) {
                        ball.vx *= -1;
                    } else {
                        ball.vy *= -1;
                    }

                    block.destroy();
                    this.blocks.splice(i, 1);
                    return;
                }
            }
        }
    }
}