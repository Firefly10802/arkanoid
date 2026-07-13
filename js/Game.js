import Ball from "./entities/Ball.js";
import Block from "./entities/Block.js";
import Paddle from "./entities/Paddle.js";
import { hitRectangle } from "./utils.js";
import { Assets, Container, Spritesheet, Text, Texture, Sprite } from "./pixi.mjs";
import Bonus from "./entities/Bonus.js";
import Menu from "./Menu.js";
import { levels, blockType, getBlockType, validateLevel, getLevelInfo } from './Levels.js';
import Background from "./Background.js";

export default class Game {
    #app;
    #currentLevel = 0;
    #maxLevels = levels.length;
    #tickerHandlers = [];
    _keydownHandler = null;
    _keyupHandler = null;
    #spritesheet = null;
    #textures = null;
    #background = null;

    constructor(app) {
        this.#app = app;
        this.loadAllAssets().then(() => {
            this.createBackground();
            this.menu = new Menu(
                this.#app, 
                () => this.startGame(),
                (levelIndex) => this.startLevel(levelIndex)
            );
            this.#app.stage.addChild(this.menu);
            this.isGameRunning = false;
            this.level = 1;
            this.blocksConfig = null;
        })
        
    }
    async loadAllAssets() {
        await Promise.all([
            this.loadTextures(),
        ]);
    }
    async loadTextures() {
        try { 
            this.#spritesheet = await Assets.load('assets/atlas.json');

            const bgTexture = await Assets.load('assets/bg.png');
            console.log('Фон загружен');

            this.#textures = {
                blueBlock: this.#spritesheet.textures['blue_block'],
                greenBlock: this.#spritesheet.textures['green_block'],
                lightBlock: this.#spritesheet.textures['ligth_block'],
                purpleBlock: this.#spritesheet.textures['purple_block'],
                silverBlock: this.#spritesheet.textures['silver_block'],
                yellowBlock: this.#spritesheet.textures['yellow_block1'],
                hud: this.#spritesheet.textures['hud'],
                hp1: this.#spritesheet.textures['hp1'],
                hp2: this.#spritesheet.textures['hp2'],
                hp3: this.#spritesheet.textures['hp3'],
                background: bgTexture,
                ball: this.#spritesheet.textures['ball'],
            };
        } catch (error) {
            console.error('Ошибка загрузки текстур:', error);
            throw error;
        }
    }
    createHUD() {
        this.hudContainer = new Container();
        this.hudContainer.x = 0;
        this.hudContainer.y = this.#app.screen.height - 118; 
        const hudBg = new Sprite(this.#textures.hud);
        hudBg.x = 100;
        hudBg.y = 0;
        hudBg.width = 600;
        hudBg.height = 118;
        this.hudContainer.addChild(hudBg);

        this.scoreText = new Text({
            text: '0',
            style: {
                fontSize: 20,
                fill: 0xffffff,
                fontWeight: 'bold',
                fontFamily: 'long_pixel-7',
                align: 'right',
            }
        });
        this.scoreText.x = this.#app.screen.width - 300;
        this.scoreText.y = 45;
        this.hudContainer.addChild(this.scoreText);

        const scoreLabel = new Text({
            text: 'СЧЁТ:',
            style: {
                fontSize: 20,
                fill: 0xaaaaaa,
                fontFamily: 'long_pixel-7',
            }
        });
        scoreLabel.x = this.#app.screen.width - 300;
        scoreLabel.y = 10;
        this.hudContainer.addChild(scoreLabel);

        this.levelText = new Text({
            text: `${this.#currentLevel + 1}`,
            style: {
                fontSize: 20,
                fill: 0xffff00,
                fontWeight: 'bold',
                fontFamily: 'long_pixel-7',
            }
        });
        this.levelText.x = this.#app.screen.width - 450;
        this.levelText.y = 45;
        this.hudContainer.addChild(this.levelText);

        const levelLabel = new Text({
            text: 'УРОВЕНЬ',
            style: {
                fontSize: 20,
                fill: 0xaaaaaa,
                fontFamily: 'long_pixel-7',
            }
        });
        levelLabel.x = this.#app.screen.width - 450;
        levelLabel.y = 10;
        this.hudContainer.addChild(levelLabel);

        this.healthContainer = new Container();
        this.healthContainer.x = 120;
        this.healthContainer.y = 45;
        this.hudContainer.addChild(this.healthContainer);

        const healthLabel = new Text({
            text: 'ЖИЗНИ',
            style: {
                fontSize: 20,
                fill: 0xaaaaaa,
                fontFamily: 'long_pixel-7',
            }
        });
        healthLabel.x = 120;
        healthLabel.y = 10;
        this.hudContainer.addChild(healthLabel);

        this.#app.stage.addChild(this.hudContainer);

        this.updateHealthIcons();
    }
    updateHealthIcons() {
        this.healthContainer.removeChildren();

        const texture = this.#textures.hp1;
        if (!texture) return;

        const spacing = 30;
        const startX = 0;

        for (let i = 0; i < this.health; i++) {
            const hpSprite = new Sprite(texture);
            hpSprite.x = startX + i * spacing;
            hpSprite.y = 8;
            hpSprite.width = 26;
            hpSprite.height = 24;
            this.healthContainer.addChild(hpSprite);
        }
    }
    createBackground() {
        const bgTexture = this.#textures?.background;
        this.#background = new Background(bgTexture, this.#app);
        this.#app.stage.addChildAt(this.#background, 0);
        
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
        
        if (this.hudContainer) {
            this.#app.stage.removeChild(this.hudContainer);
            this.hudContainer = null;
        }

        this.paddle = new Paddle();
        this.paddle.x = 340;
        this.paddle.y = 610;
        this.#app.stage.addChild(this.paddle);

        const ballTexture = this.#textures?.ball;
        this.ball = new Ball(ballTexture);
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius;
        this.#app.stage.addChild(this.ball);
        this.balls = [this.ball];

        this.createLevel(this.#currentLevel);

        this.score = 0;
        this.health = 3;    
        this.bonuses = [];

        this.createHUD();
        this.updateScore();
        this.updateHealth();
        this.updateLevel();

        this.isGameRunning = true;
        this.setupControls();
        this.#app.ticker.start();
        this.startLoop();
    }
    updateLevel() {
        if (this.levelText) {
            this.levelText.text = `${this.#currentLevel + 1}`;
        }
    }
    createBlocksFromMap(levelConfig) {
        const blocks = [];
        const { map } = levelConfig;
        
        const blockWidth = 38;
        const blockHeight = 18;
        const padding = 3;
        
        const maxWidth = Math.max(...map.map(row => row.length));
        const totalWidth = maxWidth * (blockWidth + padding) - padding;
        const offsetX = (this.#app.screen.width - totalWidth) / 2;
        const offsetY = 50;

        const textureMap = {
            'B': this.#textures.blueBlock ,
            'Y': this.#textures.yellowBlock1,
            'P': this.#textures.purpleBlock,
            'G': this.#textures.greenBlock,
            'L': this.#textures.lightBlock,
            'S': this.#textures.silverBlock
        }

        for (let row = 0; row < map.length; row++) {
            const rowStr = map[row];
            for (let col = 0; col < rowStr.length; col++) {
                const char = rowStr[col];
                
                if (char === ' ') continue;
                
                const blockType = getBlockType(char);
                if (!blockType) {
                    console.warn(`Неизвестный символ "${char}" на позиции [${row}][${col}]`);
                    continue;
                }

                const x = offsetX + col * (blockWidth + padding);
                const y = offsetY + row * (blockHeight + padding);
                const color = blockType.color;
                const hp = blockType.hp;
                
                const texture = textureMap[char];
            
                const block = new Block(x, y, blockWidth, blockHeight, color, hp, texture);
                blocks.push(block);
                this.#app.stage.addChild(block);
                
            }
        }

        return blocks;
    }
    createLevel(levelIndex) {
        if (this.blocks) {
            this.blocks.forEach(block => block.destroy());
        }
        
        const levelConfig = levels[levelIndex % this.#maxLevels];
        this.blocks = this.createBlocksFromMap(levelConfig);
        return this.blocks;
    }
    nextLevel() {
        this.#currentLevel++;

        if (this.#currentLevel >= this.#maxLevels) {
            this.showVictoryScreen();
            return;
        }

        this.bonuses.forEach(bonus => {
            this.#app.stage.removeChild(bonus);
        });
        this.bonuses = [];

        this.createLevel(this.#currentLevel);

        this.resetBall();

        this.updateLevel();

        this.showLevelMessage(`Уровень ${this.#currentLevel + 1}`);
    }

    showLevelMessage(text) {
        if (this._levelMessage) {
            this.#app.stage.removeChild(this._levelMessage);
            this._levelMessage = null;
        }

        const message = new Text({
            text: text,
            style: {
                fontSize: 48,
                fill: 0x00ff00,
                fontWeight: 'bold',
                fontFamily: 'long_pixel-7'
            }
        });
        message.anchor.set(0.5);
        message.x = this.#app.screen.width / 2;
        message.y = this.#app.screen.height / 2 - 100;
        this.#app.stage.addChild(message);
        this._levelMessage = message;

        setTimeout(() => {
            if (this._levelMessage && this.#app.stage.children.includes(this._levelMessage)) {
                this.#app.stage.removeChild(this._levelMessage);
                this._levelMessage = null;
            }
        }, 1500);
    }
    showVictoryScreen() {
        this.#app.ticker.stop();
        this.isGameRunning = false;

        if (this._levelMessage) {
            this.#app.stage.removeChild(this._levelMessage);
            this._levelMessage = null;
        }
        
        const victoryText = new Text({
            text: 'ПОЗДРАВЛЯЮ! ВЫ ПРОШЛИ ВСЕ УРОВНИ!',
            style: { 
                fontSize: 48, 
                fill: 0x00ff00, 
                fontWeight: 'bold',
                fontFamily: 'long_pixel-7'
            }
        });
        victoryText.anchor.set(0.5);
        victoryText.x = this.#app.screen.width / 2;
        victoryText.y = this.#app.screen.height / 2 - 50;
        this.#app.stage.addChild(victoryText);

        const menuText = new Text({
            text: 'Нажми E для выхода в меню',
            style: { 
                fontSize: 32, 
                fill: 0xffffff,
                fontFamily: 'long_pixel-7' 
            }
        });
        menuText.anchor.set(0.5);
        menuText.x = this.#app.screen.width / 2;
        menuText.y = this.#app.screen.height / 2 + 50;
        this.#app.stage.addChild(menuText);

        const onKeyDown = (e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {
                this.goToMenu();
                window.removeEventListener('keydown', onKeyDown);
            }
        };
        
        window.addEventListener('keydown', onKeyDown);
        this._victoryHandler = () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }
    startLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.#maxLevels) {
            this.#currentLevel = levelIndex;
            this.startGame();
        } else {
            console.error(`Уровень ${levelIndex} не найден`);
        }
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
            const margin = 160;

            if (keys.left) this.paddle.x -= 10;
            if (keys.right) this.paddle.x += 10;

            if (this.paddle.x < margin) this.paddle.x = margin;
            if (this.paddle.x > this.#app.screen.width - this.paddle.width - margin) {
                this.paddle.x = this.#app.screen.width - this.paddle.width - margin;
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
                    this.score += 1000;
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
            const clampedHitPos = Math.max(-0.7, Math.min(0.7, hitPos)); 
            const speed = ball.speed;
            const angle = clampedHitPos * Math.PI / 3.5; 

            ball.vx = speed * Math.sin(angle);
            ball.vy = -Math.abs(speed * Math.cos(angle));

            const minVx = 0.8; 
            if (Math.abs(ball.vx) < minVx) {
                ball.vx = minVx * (ball.vx >= 0 ? 1 : -1);
            }

            if (ball.x < 30 && ball.vx < 0) {
                ball.vx = Math.abs(ball.vx); 
                ball.vy = -Math.abs(ball.vy);
            }
            if (ball.x > this.#app.screen.width - 30 && ball.vx > 0) {
                ball.vx = -Math.abs(ball.vx);
                ball.vy = -Math.abs(ball.vy);
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
            const ballTexture = this.#textures?.ball;
            const newBall = new Ball(ballTexture);

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

                        if (this.blocks.length === 0) {
                            this.nextLevel();
                            return;
                        }

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
        if (this.scoreText) {
            this.scoreText.text = `${this.score}`;
        }
    }

    updateHealth() {
        this.updateHealthIcons();
    }
    
    resetBall() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            this.#app.stage.removeChild(this.balls[i]);
        }
        this.balls = [];

        const ballTexture = this.#textures?.ball;
        const newBall = new Ball(ballTexture);
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
            style: { 
                fontSize: 60, 
                fill: 0xff0000, 
                fontWeight: 'bold',
                fontFamily: 'long_pixel-7' 
            }
        });
        gameOverText.x = this.#app.screen.width / 2 - 200;
        gameOverText.y = this.#app.screen.height / 2 - 50;
        this.#app.stage.addChild(gameOverText);

        const restartText = new Text({
            text: 'Нажми R для рестарта',
            style: { 
                fontSize: 32, 
                fill: 0xffffff,
                fontFamily: 'long_pixel-7' 
            }
        });
        restartText.x = this.#app.screen.width / 2 - 150;
        restartText.y = this.#app.screen.height / 2 + 50;
        this.#app.stage.addChild(restartText);
        const menuText = new Text({
            text: 'Нажми E для выхода в меню',
            style: { 
                fontSize: 32, 
                fill: 0xffffff,
                fontFamily: 'long_pixel-7' 
            }
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
        this.clearKeyboardHandlers();

        this.#currentLevel = 0; 
        this.score = 0;
        this.health = 3;
        this.updateScore();
        this.updateHealth();

        this.blocks.forEach(block => {
            block.destroy();
        });
        this.blocks = [];

        this.createLevel(this.#currentLevel);

        this.resetBall();

        this.paddle.x = 340;
        this.paddle.y = 610;

        this.bonuses.forEach(bonus => this.#app.stage.removeChild(bonus));
        this.bonuses = [];

        if (this.hudContainer) {
            this.#app.stage.removeChild(this.hudContainer);
            this.hudContainer = null;
        }
        this.createHUD();
        this.updateScore();
        this.updateHealth();
        this.updateLevel();

        this.setupControls();

        this.startLoop();
        this.#app.ticker.start();

        this.#app.stage.children
            .filter(child => 
                child.text === 'ИГРА ОКОНЧЕНА' || 
                child.text === 'Нажми R для рестарта' || 
                child.text === 'Нажми E для выхода в меню'
            )
            .forEach(child => this.#app.stage.removeChild(child));
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

        if (this._levelMessage) {
            this.#app.stage.removeChild(this._levelMessage);
            this._levelMessage = null;
        }
        if (this.hudContainer) {
            this.#app.stage.removeChild(this.hudContainer);
            this.hudContainer = null;
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