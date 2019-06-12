
const WIDTH = 900
const HEIGHT = 400

var canvas;
var canvasContext;

var mousePos = new Point(0,0);

var keyDown = -1;

const WHITE_KEY = {'A':0, 'Z':1, 'S':2, 'X':3, 'D':4, 'C':5, 'F':6, 
		  'G':7, 'B':8, 'H':9, 'N':10, 'J':11, 'M':12, 'K':13};
const BLACK_KEY = {'Q':0, 'W':1, 'E':2, 'R':3, 'T':4, 'Y':5, 'U':6, 'I':7, 'O':8, 'P':9};

function drawRoundBottomRect(ctx, x, y, width, height, radius, color) {
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

function drawWhiteName(ctx, ch, x, y) {
	//console.log('White Key ch=', ch, x, y);
	ctx.font = 'bold 16px Arial';
	ctx.fillStyle = 'black';
	ctx.fillText(ch, x, y); 	
}
function drawBlackName(ctx, ch, x, y) {
	//console.log('White Key ch=', ch, x, y);
	ctx.font = 'bold 16px Arial';
	ctx.fillStyle = 'white';
	ctx.fillText(ch, x, y); 	
}

function Point(x, y){
	this.x = x;
	this.y = y;
}
function KeyTile(x, y, w, h, color, key){
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.hit = false;
	this.color = color;
	this.key = key;
	this.contains = function(p1) {
		return this.x < p1.x && p1.x < this.x+this.width
		&& this.y < p1.y && p1.y < this.y+this.height;
	}
	this.draw = function() {
		if (this.color === 'white') {
			if (this.hit) {
				drawRoundBottomRect(canvasContext, this.x, this.y, this.width, this.height, 5, 'lightgray');
			}
			else {
				drawRoundBottomRect(canvasContext, this.x, this.y, this.width, this.height, 5, this.color);
			}
			drawWhiteName(canvasContext, Object.keys(WHITE_KEY)[this.key], this.x+25, 220);
		}
		else {
			if (this.hit) {
				drawRoundBottomRect(canvasContext, this.x, this.y, this.width, this.height, 5, 'dimgray');
			}
			else {
				drawRoundBottomRect(canvasContext, this.x, this.y, this.width, this.height, 5, this.color);
			}
			drawBlackName(canvasContext, Object.keys(BLACK_KEY)[this.key], this.x+14, 130);
		}
		
	}
}

var whiteKeys = [];
var blackKeys = [];

var whitekeyMap = [40, 42, 44, 45, 47, 49, 51,
				   52, 54, 56, 57, 59, 61, 63];
var blackkeyMap = [41, 43, 46, 48, 50, 
	   			   53, 55, 58, 60, 62];

function buildKeyTiles() {
	// white key tile
	for (var i=0; i<14; ++i) {
		whiteKeys.push(new KeyTile(i*60, 0, 60, 250, 'white', whiteKeys.length));
	}
	// black key tile
	for (var i=0; i<14; ++i) {
		if (i===2 || i===6 || i===9 || i===13)
			continue;
		blackKeys.push(new KeyTile(i*60+40, 0, 40, 150, 'black', blackKeys.length));
	}
}
function drawWhiteKeys() {
	for (var i=0; i<whiteKeys.length; ++i) {
		whiteKeys[i].draw();
	}
}

function drawBlackKeys() {
	for (var i=0; i<blackKeys.length; ++i) {
		blackKeys[i].draw();
	}
}

function handleMouseMove(evt) {
	mousePos.x = evt.clientX;
	mousePos.y = evt.clientY;
}
function getKeyHit() {
	// check black key
	for (var i=0; i<blackKeys.length; ++i) {
		if (blackKeys[i].contains(mousePos)) 
			return {'color':'black', 'key':i, 'map':blackkeyMap[i]};
	}
	// check white key
	for (var i=0; i<whiteKeys.length; ++i) {
		if (whiteKeys[i].contains(mousePos)) 
			return {'color':'white', 'key':i, 'map':whitekeyMap[i]};
	}
	return {'color':undefined, 'key':-1, 'map':-1};
}
function handleMouseDown(evt) {
	var keyObj = getKeyHit();
	if (keyObj.color === undefined)
		return;
	if (keyObj.color === 'black') {
		blackKeys[keyObj.key].hit = true;
	}
	else if (keyObj.color === 'white') {
		whiteKeys[keyObj.key].hit = true;
	}
	drawWhiteKeys();
	drawBlackKeys();
	var n = keyObj.map;
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
	var keyObj = getKeyHit();
	if (keyObj.color === undefined)
		return;
	if (keyObj.color === 'black') {
		blackKeys[keyObj.key].hit = false;
	}
	else if (keyObj.color === 'white') {
		whiteKeys[keyObj.key].hit = false;
	}
	drawWhiteKeys();
	drawBlackKeys();
}
function handleKeyDown(evt) {
	if (evt.repeat !== undefined) {
		if (evt.keyCode !== -1)
			keyDown = evt.keyCode;
	}
	if (keyDown !== -1) {
		var n = -1;
		var ch = String.fromCharCode(keyDown);
		if (ch in WHITE_KEY) {
			var key = WHITE_KEY[ch];
			whiteKeys[key].hit = true;
			n = whitekeyMap[WHITE_KEY[ch]];
		}
		else if (ch in BLACK_KEY) {
			var key = BLACK_KEY[ch];
			blackKeys[key].hit = true;
			n = blackkeyMap[BLACK_KEY[ch]];
		}
		if (n <= 0)	return;
		drawWhiteKeys();
		drawBlackKeys();
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
}

function handleKeyUp(evt) {
	if (keyDown !== -1) {
		var ch = String.fromCharCode(keyDown);
		if (ch in WHITE_KEY) {
			var key = WHITE_KEY[ch];
			whiteKeys[key].hit = false;
		}
		else if (ch in BLACK_KEY) {
			var key = BLACK_KEY[ch];
			blackKeys[key].hit = false;
		}
		else return;
		drawWhiteKeys();
		drawBlackKeys();
	}
    keyDown = -1;
}

function start() {
	canvas = document.getElementById("gamepan");
	canvasContext = canvas.getContext("2d");

	buildKeyTiles();
	drawWhiteKeys();
	drawBlackKeys();
	
    document.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

}
document.addEventListener( 'DOMContentLoaded', start);

