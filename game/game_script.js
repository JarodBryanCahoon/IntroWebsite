/*
 * "Constants"
 */
// frames per second to run game
var FPS = 50;
// color for everything
var COLOR = '#000000';
// ball specific values
var BALL_IMAGE = 'images/ball.gif';
var BALL_SPEED = 4;
var BALL_SIZE = 15;
// paddle specific values
var PADDLE_SOUND = 'sounds/pong_beep.wav';
var PADDLE_SPEED = 5;
var PADDLE_SIZE = 10;
var STARTING_LIVES = 5;
// Brick Specific Stuff
var BRICK_WIDTH = 10;
var BRICK_HEIGHT = 5;
var BRICK_COLOR = '#db5727';


/*
 * Image and Sound manager
 */
// handle image and sounds loading, really only needed for LOTS or BIG images and sounds
class ResourceManager {
    constructor () {
        this.numImagesLeftToLoad = 0;
        this.numSoundsLeftToLoad = 0;
    }

    // these need to be called BEFORE the game starts so they are loaded and available DURING the game
    loadImage (url) {
        // create actual HTML element and note when it finishes loading
        var img = new Image();
        var self = this;
        img.onload = function () {
            self.numImagesLeftToLoad -= 1;
            console.log(url + ' loaded');
            // reset so it is only counted once (just in case)
            this.onload = null;
        }
        img.onerror = function () {
            console.log('ERROR: could not load ' + url);
        }
        img.src = url;
        this.numImagesLeftToLoad += 1;
        return img;
    }

    loadSound (url) {
        // create actual HTML element and note when it finishes loading
        var snd = new Audio();
        var self = this;
        snd.oncanplay = function () {
            self.numSoundsLeftToLoad -= 1;
            console.log(url + ' loaded');
            // reset so it is only counted once (just in case)
            this.oncanplay = null;
        }
        snd.onerror = function () {
            console.log('ERROR: could not load ' + url);
        }
        snd.src = url;
        this.numSoundsLeftToLoad += 1;
        return snd;
    }

    isLoadingComplete () {
        return this.numImagesLoaded === this.numImagesExpected &&
            this.numSoundsLoaded === this.numSoundsExpected;
    }
}


/*
 * Key and mouse input manager
 */
class InputManager {
    constructor (canvas) {
        this.canvas = canvas;
        this.leftPressed = false;
        this.rightPressed = false;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    get upPressed () {
        return this._upPressed;
    }
    get downPressed () {
        return this._downPressed;
    }

    set upPressed (pressed) {
        this._upPressed = pressed;
    }
    set downPressed (pressed) {
        this._downPressed = pressed;
    }

    keyDownHandler (e) {
        if (e.keyCode == 38) {
            this.upPressed = true;
        }
        else if (e.keyCode == 40) {
            this.downPressed = true;
        }
        else if(e.keyCode == 13 && looper.getState() == splash){
            console.log("the switch is being called!");
            splash.remove();
            looper.setState(game);
        }
    }

    keyUpHandler (e) {
        if (e.keyCode == 38) {
            this.upPressed = false;
        }
        else if(e.keyCode == 40) {
            this.downPressed = false;
        }
    }

}


/*
 * Generic game element that can move and be drawn on the canvas.
 */
class Sprite {
    constructor (x, y, width, height, dx, dy) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.dy = dy;
    }

    get x () {
        return this._x;
    }

    get y () {
        return this._y;
    }

    get dx () {
        return this._dx;
    }

    get dy () {
        return this._dy;
    }

    get nextX () {
        return this._x + this._dx;
    }

    get nextY () {
        return this._y + this._dy;
    }

    get width () {
        return this._width;
    }

    get height () {
        return this._height;
    }


    set x (x) {
        this._x = x;
    }

    set y (y) {
        this._y = y;
    }

    set dx (dx) {
        this._dx = dx;
    }

    set dy (dy) {
        this._dy = dy;
    }

    set width (w) {
        this._width = w;
    }

    set height (h) {
        this._height = h;
    }

    reset () {
        this.x = this.startX;
        this.y = this.startY;
    }

    move (canvas) {
    }

    draw (ctx) {
    }
}
class Brick{
    constructor (x, y, c){
       this.xPos = x;
       this.yPos = y;
       this.w = BRICK_WIDTH;
       this.h = BRICK_HEIGHT;
       this.canvas = c;
       this.ctx = this.canvas.getContext('2d');
    }

    getWidth(){
        return this.w;
    }

    getHeight(){
        return this.h;
    }

    draw(){
        this.ctx.fillStyle = BRICK_COLOR;
        this.ctx.fillRect(this.xPos, this.yPos, this.w, this.h);
    }

    remove(){
        this.ctx.clearRect(this.xPos, this.yPos, this.w, this.h);
    }


}

class Ball extends Sprite {
    constructor (image, x, y, size, dx, dy) {
        super(x, y, size, size, dx, dy);
        this.image = image;
    }

    get size () {
        return this.width;
    }

    move () {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw (ctx) {
        if (this.image != null) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
        else {
            // set features first, so they are active when the rect is drawn
            ctx.beginPath();
            ctx.fillStyle = COLOR;
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI*2);
            ctx.fill();
            ctx.closePath();
        }
    }
}

class Paddle extends Sprite {
    constructor (x, y, width, height, dx, dy) {
        super(x, y, width, height, dx, dy);
    }

    move (canvas) {
        if (input.downPressed && this.y < canvas.height - this.height) {
            this.y += this.dy;
        }
        else if (input.upPressed && this.y > 0) {
            this.y -= this.dy;
        }
        else if (input.mouseInBounds()) {
            this.y = input.mouseY - this.height / 2;
        }
    }

    draw (ctx) {
        // set features first, so they are active when the rect is drawn
        ctx.fillStyle = COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class LiveCount{
    constructor (c){
        this.canvas = c;
        this.ctx = this.canvas.getContext('2d');
        this.lives = STARTING_LIVES;
    }

    changeLives(arg){
        if(arg){
            decrementLives();
        } else{
            incrementLives();
        }
    }

    decrementLives(){
        this.lives--;
    }

    incrementLives(){
        this.lives++;
    }
    checkLives(){
        if(this.lives == 0){
            //Need to go to loss screen
        }
    }
}

class Splash{
    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
    }

    draw(ctx){
        ctx.font = '16px Comic Sans';
        ctx.fillStyle = COLOR;
        ctx.fillText("Hello, welcome to my game!", 50, 50);
        ctx.fillText("To beat this game, destroy all of the blocks!", 50, 100);
        ctx.fillText("If you lose all of your lives, you lose!");
        ctx.fillText("Press the left and right arrows to move the paddle!", 50, 200);
    }

    loop(){
        this.draw(this.ctx);
    }

    remove(){
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        console.log("Splash has been removed");
    }
}

class LoopManager{
    constructor(initial){
        this.state = initial;
    }

    loop(){
       this.state.loop();
    }

    getState(){
        return this.state;
    }

    setState(newState){
        this.state = newState;
    }
}
/*
 * Game class contains everything about the game and displays in a given canvas
 */
class Game {
    var levels = [new Level(3,1,2), new Level(3,3,3), new Level(4,2,2)];
    var index = 0;
    var currentBricks = 
    constructor (canvas) {
        // the area in the HTML document where the game will be played
        this.canvas = canvas;
        // the actual object that handles drawing on the canvas
        this.ctx = this.canvas.getContext('2d');
        this.paddleSound = resources.loadSound(PADDLE_SOUND);
        // elements in the game
        this.ball = new Ball(resources.loadImage(BALL_IMAGE),
            this.canvas.width / 2, this.canvas.height / 2, BALL_SIZE,
            BALL_SPEED, -BALL_SPEED);
        this.paddle = new Paddle(this.canvas.width - PADDLE_SIZE * 3, (this.canvas.height - PADDLE_SIZE * 6) / 2,
            PADDLE_SIZE, PADDLE_SIZE * 6, 0, PADDLE_SPEED);
    }

    loop () {
        if (resources.isLoadingComplete()) {
            this.update();
            this.draw();
        }
    }

    update() {
        this.ball.move(this.canvas);
        this.paddle.move(this.canvas);
        this.checkCollisions(this.canvas);
        // no way to win or lose, it just plays forever!
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ball.draw(this.ctx);
        this.paddle.draw(this.ctx);
    }

    checkCollisions() {
        if (this.ball.nextY > this.canvas.height - this.ball.size || this.ball.nextY < 0) {
            this.ball.dy = -this.ball.dy;
        }
        if (this.ball.nextX < 0) {
            this.ball.dx = -this.ball.dx;
        }
        else if (this.ball.nextX > this.paddle.x - this.ball.size &&
            this.ball.nextY > this.paddle.y && this.ball.nextY < this.paddle.y + this.paddle.height) {
            this.ball.dx = -this.ball.dx;
            this.paddleSound.play();
            this.score.increment();
        }
        else if (this.ball.nextX > this.canvas.width - this.ball.size) {
            this.ball.reset();
            this.paddle.reset();
            this.score.reset();
        }
    }
}

class Level{
    var brickList;
    constructor(number, rows, cols, canvas){
        this.bricknum = number;
        this.rows = rows;
        this.columns = cols;
        this.canvas = canvas;
    }

    initialize(){
        for(i = 0; i < rows; i ++){
            for(j = 0; j < cols; j++){
                if(brickList.length < number){
                    brickList.push(new Brick(i*))
                }
            }
        }
    }

    removeBrick(brick){
        brick.remove();
        var index = brickList.indexOf(brick);
        bricklist.splice(index,1);
    }

    getBricks(){
        return this.brickList;
    }
}

/*
 * Setup classes
 */
var canvas = document.getElementById('gameCanvas');
var resources = new ResourceManager();
var input = new InputManager(canvas);
var splash = new Splash(canvas);
var game = new Game(canvas);
var looper = new LoopManager(splash);

/*
 * Setup input responses
 */
// respond to both keys and mouse movements
document.addEventListener('keydown', event => input.keyDownHandler(event), false);
document.addEventListener('keyup', event => input.keyUpHandler(event), false);
document.addEventListener('mousemove', event => input.mouseMoveHandler(event), false);

/*
 * Game loop
 */
// NOT IDEAL --- just starts when the everthing is done loading, not necessarily when the user is ready
setInterval(function() {
    console.log("Loop is being called");
    looper.loop();
}, 1000/FPS);