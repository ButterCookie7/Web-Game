
const ZERO_POS = { x : 0, y : 0 };

var canvas;
var canvasContext;

const CENTER_POS = { x : 400, y : 270 };

function Button(color) {
	this.litSprite = sprites[color+'lit'];
	this.unlitSprite = sprites[color+'unlit'];
	this.litState = false;
	this.size = { x : this.litSprite.width, y : this.litSprite.height };
	
	var pos = { x : 0, y : 0 };
	if (color === "red") {
		pos.x = CENTER_POS.x - this.size.x;
		pos.y = CENTER_POS.y - this.size.y;
	}
	else if (color === "green") {
		pos.x = CENTER_POS.x;
		pos.y = CENTER_POS.y - this.size.y;
	}
	else if (color === "blue") {
		pos.x = CENTER_POS.x - this.size.x;
		pos.y = CENTER_POS.y;
	}
	else if (color === "yellow") {
		pos.x = CENTER_POS.x;
		pos.y = CENTER_POS.y;
	}
	this.position = pos;

	this.draw = function () {
		if (this.litState) {
			drawImage(this.litSprite, this.position, 0, ZERO_POS);
		}
		else {
			drawImage(this.unlitSprite, this.position, 0, ZERO_POS);
		}
	};

};

var spritesStillLoading = 0;
var sprites = {};

const LOOPDELAY = 80;
var gameCountdown = -1

var myButtons = [];
var playButton;
var playPosition = 0;
var playingAnimation = false;
var score = 0;
var playerInput = [];
var signalScore = false;
var gameStarted = false;

window.requestAnimationFrame =  window.requestAnimationFrame ||
								window.webkitRequestAnimationFrame ||
								window.mozRequestAnimationFrame ||
								window.oRequestAnimationFrame ||
								window.msRequestAnimationFrame ||
								function (callback) {
    								window.setTimeout(callback, 1000 / FPS);
								};

function clearCanvas() {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}
function drawImage (sprite, position, rotation, center) {
	canvasContext.save();
	canvasContext.translate(position.x, position.y);
	canvasContext.rotate(rotation);
	canvasContext.drawImage(sprite, 0, 0, sprite.width, sprite.height,
			-center.x, -center.y, sprite.width, sprite.height);
	canvasContext.restore();
}
function update() {
}

function handleMouseDown(evt) {
    if (evt.which === 1) {
        if (!leftDown)
            leftPressed = true;
        leftDown = true;
    }
}

function handleMouseUp(evt) {
    if (evt.which === 1) {
        leftDown = false;
    }
}

function draw() {
	drawImage(playButton, { x : 400, y : 540 }, 0, playButtonCen);
	for (var i=0; i<myButtons.length; ++i) {
		myButtons[i].draw();
	}
}

function loadSprite(imageName) {
    var image = new Image();
    image.src = imageName;
    spritesStillLoading += 1;
    image.onload = function () {
        spritesStillLoading -= 1;
    };
    return image;
}
function loadAssets() {
	sprites["redunlit"] = loadSprite("images/redunlit.png");
	sprites["greenunlit"] = loadSprite("images/greenunlit.png");
	sprites["blueunlit"] = loadSprite("images/blueunlit.png");
	sprites["yellowunlit"] = loadSprite("images/yellowunlit.png");
	sprites["redlit"] = loadSprite("images/redlit.png");
	sprites["greenlit"] = loadSprite("images/greenlit.png");
	sprites["bluelit"] = loadSprite("images/bluelit.png");
	sprites["yellowlit"] = loadSprite("images/yellowlit.png");
	sprites["play"] = loadSprite("images/play.png");

}
function assetLoadingLoop() {
    if (spritesStillLoading > 0)
        window.requestAnimationFrame(assetLoadingLoop);
    else {
        initialize();
        mainLoop();
    }
}
function handleInput() {

}
    
function initialize() {
	// button init
	playButton = sprites["play"];
	playButtonCen = { x : playButton.width / 2, y : playButton.height / 2};
	myButtons.push(new Button('red'));
	myButtons.push(new Button('green'));
	myButtons.push(new Button('blue'));
	myButtons.push(new Button('yellow'));
	// mouse initialize
    document.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
}
function mainLoop() {
    handleInput();
    update();
    
	clearCanvas();
    draw();
    
    window.requestAnimationFrame(mainLoop);
}
function start() {
	canvas = document.getElementById("gamepan");
	canvasContext = canvas.getContext("2d");
	loadAssets();
	assetLoadingLoop();
}
document.addEventListener( 'DOMContentLoaded', start);

