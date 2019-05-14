var canvas;
var canvasContext;
var ballSprite;
var mousePos = { x : 0, y : 0 };
var ballCen = { x : 0, y : 0 };
function clearCanvas() {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}
function drawImage (sprite, position, center) {
	canvasContext.save();
	canvasContext.translate(position.x, position.y);
	canvasContext.drawImage(sprite, 0, 0, sprite.width, sprite.height,
			-center.x, -center.y, sprite.width, sprite.height);
	canvasContext.restore();
}
function update() {
    //var d = new Date();
    //ballPos.x = d.getTime() * 0.3 % canvas.width;
}
function draw() {
	ballCen = { x : ballSprite.width / 2, y : ballSprite.height / 2 };
    drawImage(ballSprite, mousePos, ballCen);
}
function mainLoop() {
	clearCanvas();
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
	ballSprite = new Image();
	ballSprite.src = "img/spr_ball_red.png";
	window.setTimeout(mainLoop, 500);

}
document.addEventListener( 'DOMContentLoaded', start);

