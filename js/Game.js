import Ball from "./entities/Ball.js";
import Block from "./entities/Block.js";
import Paddle from "./entities/Paddle.js";
import { hitRectangle } from "./utils.js";
import { Text } from "./pixi.mjs";
import Bonus from "./entities/Bonus.js";
import Menu from "./Menu.js";

export default class Game {
    #app;
    #tickerHandlers = [];

    constructor(app) {
        this.#app = app;
        this.menu = new Menu(this.#app, () => this.startGame());
        this.#app.stage.addChild(this.menu);
        this.isGameRunning = false;
        this._keydownHandler = null;
        this._keyupHandler = null;
    }
    clearTickerHandlers() {
        for (const handler of this.#tickerHandlers) {
            this.#app.ticker.remove(handler);
        }
        this.#tickerHandlers = [];
    }
    clearKeyboardHandlers() {
        if (this._keydownHandler) {
            window.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        if (this._keyupHandler) {
            window.removeEventListener('keyup', this._keyupHandler);
            this._keyupHandler = null;
        }
    }
    startGame() {
        this.clearTickerHandlers();
        this.clearKeyboardHandlers();

        this.#app.ticker.stop();

        if (this.menu) {
            this.#app.stage.removeChild(this.menu);
            this.menu = null;
        }

        this.#app.stage.children
            .filter(child => child instanceof Ball || child instanceof Block || child instanceof Paddle || child instanceof Bonus)
            .forEach(child => this.#app.stage.removeChild(child));

        this.paddle = new Paddle();
        this.paddle.x = 340;
        this.paddle.y = 610;
        this.#app.stage.addChild(this.paddle);

        this.ball = new Ball();
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius;
        this.#app.stage.addChild(this.ball);
        this.balls = [this.ball];
        this.blocks = this.createBlock();
        
        this.score = 0;
        this.scoreText = new Text({
            text: 'Счёт: 0',
            style: {
                fontSize: 32,
                fill: 0xffffff,
                fontWeight: 'bold',
                fontFamily: 'Arial'
            }
        });
        this.scoreText.x = 600;
        this.scoreText.y = 710;
        this.#app.stage.addChild(this.scoreText);

        this.health = 3;    
        this.healthText = new Text({
            text: 'Жизни: 3',
            style: {
                fontSize: 32,
                fill: 0xffffff,
                fontWeight: 'bold',
                fontFamily: 'Arial'
            }
        });
        this.healthText.x = 100;
        this.healthText.y = 710;
        this.#app.stage.addChild(this.healthText);

        this.bonuses = [];

        this.isGameRunning = true;
        this.setupControls();
        this.#app.ticker.start();
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
        const hps = [2, 1, 1, 1, 1, 1];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * (width + padding);
                const y = offsetY + row * (height + padding);
                const color = colors[row % colors.length];
                const hp = hps[row % hps.length];

                const block = new Block(x, y, width, height, color, hp);
                blocks.push(block);
                this.#app.stage.addChild(block);
            }
        }

        return blocks;
    }
    setupControls() {
        const keys = { left: false, right: false };

        this._keydownHandler = (e) => {
            if (e.key === 'ArrowLeft') keys.left = true;
            if (e.key === 'ArrowRight') keys.right = true;
            if (e.key === 'z' || e.key === 'Z' || e.key === 'Я' || e.key === 'я') {
                for (const ball of this.balls) {
                    if (!ball.isLaunch) {
                        ball.launch();
                    }
                }
            }
        };

        this._keyupHandler = (e) => {
            if (e.key === 'ArrowLeft') keys.left = false;
            if (e.key === 'ArrowRight') keys.right = false;
        };

        window.addEventListener('keydown', this._keydownHandler);
        window.addEventListener('keyup', this._keyupHandler);
        
        const paddleHandler = () => {
            if (keys.left) this.paddle.x -= 10;
            if (keys.right) this.paddle.x += 10;

            if (this.paddle.x < 0) this.paddle.x = 0;
            if (this.paddle.x > this.#app.screen.width - this.paddle.width) {
                this.paddle.x = this.#app.screen.width - this.paddle.width;
            }
        };
        this.#tickerHandlers.push(paddleHandler);
        this.#app.ticker.add(paddleHandler);
    }

    startLoop() {
        const loopHandler = () => {
            if (!this.isGameRunning) return;
            
            for (let i = this.balls.length - 1; i >= 0; i--) {
                const ball = this.balls[i];

                if (!ball.isLaunch) {
                    ball.x = this.paddle.x + this.paddle.width / 2;
                    ball.y = this.paddle.y - ball.radius;
                }

                this.checkCollisions(ball);

                const result = ball.update(this.#app.screen.width, this.#app.screen.height);

                if (result === 'ball_fell') {
                    this.#app.stage.removeChild(ball);
                    this.balls.splice(i, 1);

                    if (this.balls.length === 0) {
                        this.health--;
                        this.updateHealth();
                        if (this.health <= 0) {
                            this.gameOver();
                        } else {
                            this.resetBall();
                        }
                    }
                }
            }

            if (this.balls.length === 1 && !this.balls[0].isLaunch) {
                this.balls[0].x = this.paddle.x + this.paddle.width / 2;
                this.balls[0].y = this.paddle.y - this.balls[0].radius;
            }
            
            this.bonuses.forEach(bonus => {
                bonus.update();

                if (bonus.isAlive && hitRectangle(bonus, this.paddle)) {
                    this.activateBonus(bonus.type);
                    bonus.destroy();
                    this.bonuses.splice(this.bonuses.indexOf(bonus), 1);
                }

                if (bonus.y > this.#app.screen.height) {
                    bonus.destroy();
                    this.bonuses.splice(this.bonuses.indexOf(bonus), 1);
                }
            });
            this.checkBlockCollision();
            this.updateBonusTimer();
        };
        
        this.#tickerHandlers.push(loopHandler);
        this.#app.ticker.add(loopHandler);
    }

    checkCollisions(ball) {
        ball = ball || this.ball;
        const paddle = this.paddle;

        if (hitRectangle(ball, paddle)) {
            const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            const clampedHitPos = Math.max(-0.8, Math.min(0.8, hitPos));
            const speed = ball.speed;
            const angle = clampedHitPos * Math.PI / 3;

            ball.vx = speed * Math.sin(angle);
            ball.vy = -Math.abs(speed * Math.cos(angle));

            if (Math.abs(ball.vx) < 0.1) {
                ball.vx = 0.1 * (ball.vx >= 0 ? 1 : -1);
            }

            ball.y = paddle.y - ball.radius;
        }
    }
    activateBonus(type) {
        this.resetBonuses();
        switch(type) {
            case 'wide':
                this.paddle.width = 180;
                this.updatePaddleView();
                break;
            case 'narrow':
                this.paddle.width = 60;
                this.updatePaddleView();
                break;
            case 'slow':
                this.ball.speedMultiplier = 0.7;
                break;
            case 'fast':
                this.ball.speedMultiplier = 1.3;
                break;
            case 'life':
                this.health++;
                this.updateHealth();
                break;
            case 'manyballs':
                this.spawnManyBalls();
                break;
        };

        this.activeBonus = type;
        this.bonusTimer = 0;
    }
    spawnManyBalls() {
        const newBalls = 2;

        for (let i = 0; i < newBalls; i++) {
            const newBall = new Ball();

            newBall.x = this.paddle.x + this.paddle.width / 2 + (i * 20 - 10);
            newBall.y = this.paddle.y - newBall.radius;
            newBall.vx = (i === 0 ? -1 : 1) * (0.8 + Math.random() * 0.4);
            newBall.vy = -1;
            newBall.isLaunch = true;
            newBall.speedMultiplier = this.ball.speedMultiplier;

            this.#app.stage.addChild(newBall);
            this.balls.push(newBall);
        }
    }
    updateBonusTimer() {
        if (this.activeBonus) {
            this.bonusTimer += 0.016;
            if (this.bonusTimer > 10) { 
                this.resetBonuses();
            }
        }
    }
    resetBonuses() {
        this.paddle.width = 120;
        this.ball.speedMultiplier = 1;
        this.activeBonus = null;
        this.bonusTimer = 0;
    }

    updatePaddleView() {
        this.paddle.children[0].width = this.paddle.width;
    }

    checkBlockCollision() {
    for (const ball of this.balls) {
        this.checkBlockCollisionForBall(ball);
    }
}
    checkBlockCollisionForBall(ball){
        const steps = 5;
        for (let step = 0; step < steps; step++) {
            const fraction = (step + 1) / steps;
            const checkX = ball.x + ball.speed * ball.vx * fraction;
            const checkY = ball.y + ball.speed * ball.vy * fraction;

            const tempBall = {
                x: checkX,
                y: checkY,
                width: ball.radius * 2,
                height: ball.radius * 2,
                radius: ball.radius
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
                    if (block.hp > 1) {
                        block.hp -= 1;
                    } else {
                        block.destroy();
                        this.blocks.splice(i, 1);
                        this.score += 80;
                        this.updateScore();

                        if (Math.random() < 0.2) {
                            const types = ['wide', 'narrow', 'slow', 'fast', 'life','manyballs'];
                            const type = types[Math.floor(Math.random() * types.length)];
                            const bonus = new Bonus(block.x + block.width / 2, block.y, type);
                            this.#app.stage.addChild(bonus);        
                            this.bonuses.push(bonus);
                        }
                    }
                    break;
                    
                }
            }
        }
    }

    updateScore() {
        this.scoreText.text = `Cчёт: ${this.score}`
    }

    updateHealth() {
        this.healthText.text = `Жизни: ${this.health}`
    }
    
    resetBall() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            this.#app.stage.removeChild(this.balls[i]);
        }
        this.balls = [];

        const newBall = new Ball();
        newBall.x = this.paddle.x + this.paddle.width / 2;
        newBall.y = this.paddle.y - newBall.radius;
        newBall.vx = 1;
        newBall.vy = -1;
        newBall.isLaunch = false; 
        this.resetBonuses();

        this.balls.push(newBall);
        this.#app.stage.addChild(newBall);

        this.ball = newBall;
    }


    gameOver() {
        this.#app.ticker.stop();

        if (this._gameOverHandlers) {
            this._gameOverHandlers();
            this._gameOverHandlers = null;
        }

        const gameOverText = new Text({
            text: 'ИГРА ОКОНЧЕНА',
            style: { fontSize: 64, fill: 0xff0000, fontWeight: 'bold' }
        });
        gameOverText.x = this.#app.screen.width / 2 - 200;
        gameOverText.y = this.#app.screen.height / 2 - 50;
        this.#app.stage.addChild(gameOverText);

        const restartText = new Text({
            text: 'Нажми R для рестарта',
            style: { fontSize: 32, fill: 0xffffff }
        });
        restartText.x = this.#app.screen.width / 2 - 150;
        restartText.y = this.#app.screen.height / 2 + 50;
        this.#app.stage.addChild(restartText);
        const menuText = new Text({
            text: 'Нажми E для выхода в меню',
            style: { fontSize: 32, fill: 0xffffff }
        });
        menuText.x = this.#app.screen.width / 2 - 150;
        menuText.y = this.#app.screen.height / 2 + 100;
        this.#app.stage.addChild(menuText);
        const onKeyDown = (e) => {
            if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
                this.restart();
            }
            if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {
                this.goToMenu();
            }
        };
        
        window.addEventListener('keydown', onKeyDown);
        this._gameOverHandlers = () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }

    restart() {
        this._gameOverHandlers?.();

        this.clearTickerHandlers();
        
        this.score = 0;
        this.health = 3;
        this.updateScore();
        this.updateHealth();

        this.blocks.forEach(block => {
            block.destroy();
        });
        this.blocks = [];
        
        this.blocks = this.createBlock();
        
        this.resetBall();

        this.startLoop();
        this.#app.ticker.start();

        this.#app.stage.children
            .filter(child => child.text === 'ИГРА ОКОНЧЕНА' || child.text === 'Нажми R для рестарта' || child.text === 'Нажми E для выхода в меню')
            .forEach(child => this.#app.stage.removeChild(child));
        
        this.paddle.x = 340;
        this.paddle.y = 610;
        this.bonuses.forEach(bonus => this.#app.stage.removeChild(bonus));
        this.bonuses = [];
    
    }
    goToMenu() {
        this._gameOverHandlers?.();

        this.clearTickerHandlers();
        this.clearKeyboardHandlers();
        
        this.#app.ticker.stop();
        this.isGameRunning = false;

        for (const ball of this.balls) {
            this.#app.stage.removeChild(ball);
        }
        this.balls = [];

        for (const block of this.blocks) {
            block.destroy();
        }
        this.blocks = [];

        for (const bonus of this.bonuses) {
            this.#app.stage.removeChild(bonus);
        }
        this.bonuses = [];

        if (this.paddle) {
            this.#app.stage.removeChild(this.paddle);
            this.paddle = null;
        }

        if (this.scoreText) {
            this.#app.stage.removeChild(this.scoreText);
            this.scoreText = null;
        }

        if (this.healthText) {
            this.#app.stage.removeChild(this.healthText);
            this.healthText = null;
        }

        this.#app.stage.children
            .filter(child => 
                child.text === 'ИГРА ОКОНЧЕНА' || 
                child.text === 'Нажми R для рестарта' ||
                child.text === 'Нажми E для выхода в меню'
            )
            .forEach(child => this.#app.stage.removeChild(child));
            
        if (this.menu) {
            this.#app.stage.removeChild(this.menu);
            this.menu = null;
        }
        
        this.menu = new Menu(this.#app, () => this.startGame());
        this.#app.stage.addChild(this.menu);
        this.#app.ticker.start();
    }
}