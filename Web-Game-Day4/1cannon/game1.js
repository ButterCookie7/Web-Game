var canvas;
var canvasContext;
var ballSprite;
var ballPos = { x : 0, y : 50 };

function clearCanvas() {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}
function drawImage (sprite, position) {
	canvasContext.save();
	canvasContext.translate(position.x, position.y);
	canvasContext.drawImage(sprite, 0, 0, sprite.width, sprite.height,
			0, 0, sprite.width, sprite.height);
	canvasContext.restore();
}
function update() {
    var d = new Date();
    ballPos.x = d.getTime() * 0.3 % canvas.width;
}
function draw() {
    drawImage(ballSprite, ballPos);
}
function mainLoop() {
	clearCanvas();
	update();
	draw();
	window.setTimeout(mainLoop, 1000 / 60);
}
function start() {
	canvas = document.getElementById("cannonpan");
	canvasContext = canvas.getContext("2d");
	ballSprite = new Image();
	ballSprite.src = "img/spr_ball_red.png";
	window.setTimeout(mainLoop, 500);

}
document.addEventListener( 'DOMContentLoaded', start);

