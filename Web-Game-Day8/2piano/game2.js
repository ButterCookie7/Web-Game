
const ZERO_POS = { x : 0, y : 0 };
const FPS = 60;
const SPEED = 3;
const MOVE_SPEED = 1;
const WIDTH = 900
const HEIGHT = 400

var canvas;
var canvasContext;

var keyDown = -1;

function Point(x, y){
	this.x = x;
	this.y = y;
}
function Tile(x, y, w, h){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.contains = function(p1) {
		return this.x < p1.x && p1.x < this.x+this.width
		&& this.y < p1.y && p1.y < this.y+this.height;
	}
}

function roundBottomRect(ctx, x, y, width, height, radius, color) {
	if (typeof color == 'undefined') {
		color = 'white';
	}
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
		var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + width, y);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.strokeStyle = 'black';
	ctx.fill();
	ctx.stroke();

}
var mousePos = new Point(0,0);

var whiteKeys = [];
var blackKeys = [];

var whitekeyMap = [40, 42, 44, 45, 47, 49, 51,
				   52, 54, 56, 57, 59, 61, 63];
var blackkeyMap = [41, 43, 46, 48, 50, 
	   			   53, 55, 58, 60, 62];
function drawWhiteKeys() {
	for (var i=0; i<14; ++i) {
		roundBottomRect(canvasContext, i*60, 0, 60, 250, 5, 'white');
		whiteKeys.push(new Tile(i*60, 0, 60, 250));
	}
}
function drawBlackKeys() {
	for (var i=0; i<14; ++i) {
		if (i===2 || i===6 || i===9 || i===13)
			continue;
		roundBottomRect(canvasContext, i*60+40, 0, 40, 150, 5, 'black');
		blackKeys.push(new Tile(i*60+40, 0, 40, 150));
	}
}
function handleMouseMove(evt) {
	mousePos.x = evt.clientX;
	mousePos.y = evt.clientY;
}
function getKeyNum() {
	// check black key
	for (var i=0; i<blackKeys.length; ++i) {
		if (blackKeys[i].contains(mousePos)) 
			return blackkeyMap[i];
	}
	// check white key
	for (var i=0; i<whiteKeys.length; ++i) {
		if (whiteKeys[i].contains(mousePos)) 
			return whitekeyMap[i];
	}
	return -1;
}
function handleMouseDown(evt) {
	var n = getKeyNum();
	if (n <= 0)
		return;
	var freq = 440 * Math.pow(2, (n - 49) / 12);
	soundEffect(
		    freq,          //frequency
		    0,           //attack
		    0.5,           //decay
		    "sine",  //waveform
		    1,           //volume
		    0,           //pan
		    0,           //wait before playing
		    0,           //pitch bend amount
		    false,       //reverse
		    0,           //random pitch range
		    0,          //dissonance
		    undefined,   //echo: [delay, feedback, filter]
		    undefined,    //reverb: [duration, decay, reverse?]
		    5	// timeout  -- no effect
		    );

}

function handleMouseUp(evt) {
	
}

function start() {
	canvas = document.getElementById("gamepan");
	canvasContext = canvas.getContext("2d");

	drawWhiteKeys();
	drawBlackKeys();
	
    document.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

}
document.addEventListener( 'DOMContentLoaded', start);

