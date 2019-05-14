
var canvas;
var canvasContext;

var ball = {
};
ball.initialize = function() {
    ball.position = { x : 0, y : 0 };
    ball.velocity =  { x : 0, y : 0 };
    ball.center = { x : 0, y : 0 };
    ball.sprite = sprites["ballRed"];
    ball.shooting = false;
};
ball.handleInput = function () {
    if (leftPressed && !ball.shooting) {
        ball.shooting = true;
        ball.velocity.x = (mousePos.x - ball.position.x) * 1.2;
        ball.velocity.y = (mousePos.y - ball.position.y) * 1.2;
    }
};

ball.update = function (delta) {
	//console.log(ball.sprite)
    if (ball.shooting) {
        ball.velocity.x *= 0.99;
        ball.velocity.y += 6;
        ball.position.x += ball.velocity.x * delta;
        ball.position.y += ball.velocity.y * delta;
    }
    else {
        if (markSprite === sprites["markRed"])
        	ball.sprite = sprites["ballRed"];
        else if (markSprite === sprites["markGreen"])
        	ball.sprite = sprites["ballGreen"];
        else
        	ball.sprite = sprites["ballBlue"];
        ball.position = ballPosition();
        ball.position.x -= ball.sprite.width / 2;
        ball.position.y -= ball.sprite.height / 2;
    }
    if (isOutsideWorld(ball.position))
        ball.reset();
};

ball.reset = function () {
    ball.position = { x : 0, y : 0 };
    ball.shooting = false;
};

ball.draw = function () {
    if (!ball.shooting)
        return;
    drawImage(ball.sprite, ball.position, 0, ball.center);
};
function isOutsideWorld(position) {
    return position.x < 0 || position.x > canvas.width || position.y > canvas.height;
}
function ballPosition() {
    var sero = Math.sin(cannonRot) * cannonSprite.width * 0.6;
    var garo = Math.cos(cannonRot) * cannonSprite.width * 0.6;
    return { x : cannonPos.x + garo, y : cannonPos.y + sero };
};
var cannonSprite;
var cannonPos = { x : 72, y : 405 };
var cannonCen = { x : 34, y : 34 };
var cannonRot = 0;
var ballSprite;
var ballCen = { x : 0, y : 0 };
var markSprite;
var markPos = { x : 55, y : 388 };
var markCen = { x : 0, y : 0 };

var mousePos = { x : 0, y : 0 };
var leftDown = false;
var leftPressed = false;

var spritesStillLoading = 0;
var sprites = {};

window.requestAnimationFrame =  window.requestAnimationFrame ||
								window.webkitRequestAnimationFrame ||
								window.mozRequestAnimationFrame ||
								window.oRequestAnimationFrame ||
								window.msRequestAnimationFrame ||
								function (callback) {
    								window.setTimeout(callback, 1000 / 60);
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
function update(delta) {
    var sero = mousePos.y - cannonPos.y;
    var garo = mousePos.x - cannonPos.x;
    cannonRot = Math.atan2(sero, garo);
    ball.update(delta);
}
function draw() {
	drawImage(sprites["background"], { x : 0, y : 0 }, 0, { x : 0, y : 0 });
	if (ball.shooting)
		drawImage(ball.sprite, ball.position, 0, ball.center);
    drawImage(cannonSprite, cannonPos, cannonRot, cannonCen);
    drawImage(markSprite, markPos, 0, markCen);
}
function handleMouseMove(evt) {
	mousePos = { x : evt.clientX, y : evt.clientY };
}
function handleMouseDown(evt) {
    if (evt.which === 1) {
        if (!leftDown)
            leftPressed = true;
        leftDown = true;
    }
}

function handleMouseUp(evt) {
    if (evt.which === 1)
        leftDown = false;
}
function mouseReset() {
    leftPressed = false;
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
	sprites["background"] = loadSprite("img/" + "spr_background.png");
	sprites["cannonBarrel"] = loadSprite("img/" + "spr_cannon_barrel.png");
	sprites["ballRed"] = loadSprite("img/" + "spr_ball_red.png");
	sprites["ballBlue"] = loadSprite("img/" + "spr_ball_blue.png");
	sprites["ballGreen"] = loadSprite("img/" + "spr_ball_green.png");
	sprites["markRed"] = loadSprite("img/" + "spr_cannon_red.png");
	sprites["markBlue"] = loadSprite("img/" + "spr_cannon_blue.png");
	sprites["markGreen"] = loadSprite("img/" + "spr_cannon_green.png");

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
    //cannon handleInput
	
	// ball handleInput
	ball.handleInput()
}
function initialize() {
    // cannon initialize
	cannonSprite = sprites["cannonBarrel"];
	markSprite = sprites["markRed"];
	// ball initialize
	ball.initialize();
	// Mouse initialize
    document.onmousemove = handleMouseMove;
    document.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
}
function mainLoop() {
	var delta = 1 / 60;
    handleInput();
    update(delta);
    
	clearCanvas();
    draw();
    
    mouseReset();
    window.requestAnimationFrame(mainLoop);
}
function start() {
	canvas = document.getElementById("cannonpan");
	canvasContext = canvas.getContext("2d");
	loadAssets();
	assetLoadingLoop();
}
document.addEventListener( 'DOMContentLoaded', start);

