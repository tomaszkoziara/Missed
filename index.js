var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

var milleniumFalcon = null;
var tieFighters = [];
var stars = [];

var milleniumFalconCollisionCategory = null;
var enemiesCollisionCategory = null;

var isGameOver = false;

var gameConfig = {
    type: Phaser.CANVAS,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        preload: preload,
        create: create,
        update: update,
        render: render
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0
            }
        }
    }
};
var game = new Phaser.Game(gameConfig);

function preload() {

    this.load.image('tieFighter', 'assets/tie-fighter.png');
    this.load.image('milleniumFalcon', 'assets/millenium-falcon.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('gameOver', 'assets/game-over.png');

}

function create() {

    milleniumFalconCollisionCategory = this.matter.world.nextCategory();
    enemiesCollisionCategory = this.matter.world.nextCategory();

    milleniumFalcon = this.matter.add.sprite(screenWidth / 2, screenHeight - 100, 'milleniumFalcon');
    milleniumFalcon.setCollisionCategory(milleniumFalconCollisionCategory);
    milleniumFalcon.setCollidesWith([enemiesCollisionCategory]);

    var tieFighterEmitter = new Phaser.Events.EventEmitter();
    tieFighterEmitter.on('spawnTieFighter', spawnTieFighter, this);
    var tieFighterTimer = this.time.addEvent({
        delay: 500,
        callback: function () {
            tieFighterEmitter.emit('spawnTieFighter');
        },
        callbackScope: this,
        loop: true
    });

    var starEmitter = new Phaser.Events.EventEmitter();
    starEmitter.on('spawnStar', spawnStar, this);
    var starTimer = this.time.addEvent({
        delay: 50,
        callback: function () {
            starEmitter.emit('spawnStar');
        },
        callbackScope: this,
        loop: true
    });

    spawnRandomStars();

    game.canvas.addEventListener('mousedown', function () {
        game.input.mouse.requestPointerLock();
    });

    this.input.on('pointermove', function (pointer) {

        if (this.input.mouse.locked) {
            milleniumFalcon.x += pointer.movementX;
            milleniumFalcon.y += pointer.movementY;

            if (pointer.movementX > 0) {
                milleniumFalcon.setRotation(0.1);
            } else if (pointer.movementX < 0) {
                milleniumFalcon.setRotation(-0.1);
            } else {
                milleniumFalcon.setRotation(0);
            }

        }
    }, this);

    this.input.keyboard.on('keydown_Q', function (event) {
        if (game.input.mouse.locked) {
            game.input.mouse.releasePointerLock();
        }
    }, 0, this);

    this.matter.world.on('collisionstart', function (event) {

        game.scene.getScene('default').add.sprite(screenWidth / 2, screenHeight / 2, 'gameOver')
        game.scene.pause('default');
        isGameOver = true;

    });

}

function update() {

    for (var i = 0; i < tieFighters.length; i++) {
        tieFighters[i].y += 5;
        if (tieFighters[i].y > screenHeight + tieFighters[i].height) {
            tieFighters[i].destroy('default');
            tieFighters.splice(i, 1);
        }
    }

    for (var i = 0; i < stars.length; i++) {
        stars[i].sprite.y += stars[i].vSpeed;
        if (stars[i].sprite.y > screenHeight + stars[i].sprite.height) {
            stars[i].sprite.destroy('default');
            stars.splice(i, 1);
        }
    }

}

function render() {

}

function spawnTieFighter() {
    var positionX = Math.random() * screenWidth;
    var positionY = -100;
    var tieFighter = this.matter.add.sprite(positionX, positionY, 'tieFighter');
    tieFighters.push(tieFighter);
    tieFighter.setCollisionCategory(enemiesCollisionCategory);
    tieFighter.setCollidesWith([milleniumFalconCollisionCategory]);
}

function spawnStar(posX, posY) {
    var positionX = posX || Math.random() * screenWidth;
    var positionY = posY || -5;
    var vSpeed = Math.floor(Math.random() * 3 + 1);
    var hSpeed = 0;
    var sprite = this.add.sprite(positionX, positionY, 'star');
    sprite.setScale(vSpeed);
    stars.push(new MovingObject(sprite, hSpeed, vSpeed));
}

function spawnRandomStars() {
    for (var i = 0; i < 100; i++) {
        var positionX = Math.random() * screenWidth;
        var positionY = Math.random() * screenHeight;
        spawnStar.call(game.scene.getScene('default'), positionX, positionY);
    }
}

window.onclick = function () {
    if (isGameOver) {
        game.scene.stop('default');
        milleniumFalcon = null;
        tieFighters = [];
        stars = [];
        game.scene.start('default');
        isGameOver = false;
    }
}