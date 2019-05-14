
var canvas;
var canvasContext;
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
    var sero = mousePos.y - cannonPos.y;
    var garo = mousePos.x - cannonPos.x;
    cannonRot = Math.atan2(sero, garo);
}
function draw() {
	clearCanvas();
	ballCen = { x : ballSprite.width / 2, y : ballSprite.height / 2 };
	drawImage(ballSprite, mousePos, 0, ballCen);
    drawImage(cannonSprite, cannonPos, cannonRot, cannonCen);
    drawImage(markSprite, markPos, 0, markCen);
}
function mainLoop() {
	update();
	draw();
	window.setTimeout(mainLoop, 1000 / 60);
}
function handleMouseMove(evt) {
	mousePos = { x : evt.clientX, y : evt.clientY };
}

function start() {
	canvas = document.getElementById("cannonpan");
	canvasContext = canvas.getContext("2d");
	document.onmousemove = handleMouseMove;
	cannonSprite = new Image();
	cannonSprite.src = "img/spr_cannon_barrel.png";
	ballSprite = new Image();
	ballSprite.src = "img/spr_ball_red.png";
	markSprite = new Image();
	markSprite.src = "img/spr_cannon_red.png";
	window.setTimeout(mainLoop, 500);

}
document.addEventListener( 'DOMContentLoaded', start);

