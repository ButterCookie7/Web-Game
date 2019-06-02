
const ZERO_POS = { x : 0, y : 0 };
const FPS = 60;
const SPEED = 3;
const GHOST_SPEED = 1;
const WIDTH = 600
const HEIGHT = 580

var canvas;
var canvasContext;

//var mousePos = { x : 0, y : 0 };
var keyDown = -1;

function randint(st, end) {
	return Math.floor(Math.random() * (end-st+1) + st);
}

function Ghost(sprite, pos) {
	this.sprite = sprite;
	this.position = pos;
	this.dir = randint(0,3);
	
	this.center = { x : this.sprite.width / 2, y : this.sprite.height / 2 };
	this.contains = function(p1) {
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y < p1.y && p1.y < this.position.y+this.center.y;
	};
	this.colliderect = function(target) {
		var targetX = target.position.x + target.center.x;
		var targetY = target.position.y + target.center.y;
		var distX = Math.abs(targetX - (this.position.x + this.center.x));
		var distY = Math.abs(targetY - (this.position.y + this.center.y));
		return distX < this.center.x && distY < this.center.y
	};
	this.ghostCollided = function() {
        for (var g=0; g<ghosts.length; ++g) {
            if (ghosts[g]===this && ghosts[g].colliderect(this))
                return true;
        }
        return false;
	};
	this.draw = function () {
		drawImage(this.sprite, this.position, 0, this.center);
	};
}
function Dot(sprite, pos) {
	this.sprite = sprite;
    this.position = pos;
    this.status = 0;
    
	this.center = { x : this.sprite.width / 2, y : this.sprite.height / 2 };
	this.contains = function(p1) {
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y < p1.y && p1.y < this.position.y+this.center.y;
	};
	this.draw = function () {
		drawImage(this.sprite, this.position, 0, this.center);
	};
}
function Player(sprite, pos) {
	this.sprite = sprite;
    this.position = pos;
	this.status = 0;
	this.inputActive = false;
	this.movex = 0;
	this.movey = 0;
	this.angle = 0;
	
	this.center = { x : this.sprite.width / 2, y : this.sprite.height / 2 };
	this.draw = function () {
		drawImage(this.sprite, this.position, 0, this.center);
	};
	this.contains = function(p1) {
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y < p1.y && p1.y < this.position.y+this.center.y;
	};

}

function Sound(sound) {
	this.sound = new Audio();
	this.sound.src = sound;
	this.onplay = false;
	this.play = function () {
	    if (this.sound === null || this.onplay) {
	        return;
	    }
    	//console.log("Sound play");
	    this.sound.load();
	    this.sound.autoplay = true;
	}
}

var spritesStillLoading = 0;
var sprites = {};
var sounds = {};

var player;
var pacDots = [];
var ghosts = [];

var moveGhostsFlag = 4;
var moveDelay = FPS/SPEED;
var moveCount = 0;

var score = 0;

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

function drawText(textId, textStr) {
	var textArea = document.getElementById(textId)
	textArea.innerHTML = textStr;
	textArea.style.cursor = "default";
}
function clearTexts() {
	drawText('textArea', '');
}

function isImageDataBlack(mapArray, x, y) {
	var xp = Math.floor(x/20);
	var yp = Math.floor(y/20);
	//console.log('xp, yp=', xp, yp, 'mapArray[yp][xp]=',mapArray[yp][xp], mapArray[yp][xp]==='1');
	return mapArray[yp][xp]==='1';
}

function draw() {

	clearCanvas();
	clearTexts();
	drawImage(sprites['header'], ZERO_POS, 0, ZERO_POS);
	drawImage(sprites['colourmap'], { x : 0, y : 80 }, 0, ZERO_POS);

    var pacDotsLeft = 0;
    for (var a=0; a<pacDots.length; ++a) {
        if (pacDots[a].status === 0) {
            pacDots[a].draw();
            pacDotsLeft += 1;
        }
        if (pacDots[a].contains({ x:player.position.x, y:player.position.y })) {
            pacDots[a].status = 1;
        }
    }
    if (pacDotsLeft === 0)
    	player.status = 2;
    drawGhosts();
    
    getPlayerImage();
    player.draw();

	if (player.status === 1) {
		drawText('textArea', "GAME OVER");
	}
	if (player.status === 2) {
		drawText('textArea', "YOU WIN!");
	}
}
function update() {
	if (player.status === 0) {
		moveCount +=1;
		if (moveCount < moveDelay) { // every FPS cycle
			if (moveGhostsFlag === 4) {
				moveGhosts();
			}
			for (var g=0; g<ghosts.length; ++g) {
				if (ghosts[g].contains({x:player.position.x, y:player.position.y})) {
					console.log('g=',g, "x,y=", player.position.x, player.position.y);
					player.status = 1;
				}
			}
			if (player.inputActive) {
				checkInput();
				checkMovePoint(player);
				if (player.movex || player.movey) {
					inputLock();
					//animate(player, 
					//pos=(player.x + player.movex, player.y + player.movey), 
					//duration=1/SPEED, tween='linear', on_finished=inputUnLock)
					player.x += player.movex;
					player.y += player.movey;
					inputUnLock();
				}
			} 
		}
		else { // 1/3 sec period
			console.log("moveGhostsFlag=", moveGhostsFlag);
			moveCount = 0;
		}
	}
}
function getPlayerImage() {
    var dt = new Date().getTime() * 1000; // micro seconds
    var a = player.angle;
    var tc = dt % (500000/SPEED) / (100000/SPEED);
    //console.log("tc=", tc);
    if (tc > 2.5 && (player.movex !== 0 || player.movey !== 0)) {
        if (a !== 180)
            player.sprite = sprites["pacman_c"];
        else
            player.sprite = sprites["pacman_cr"];
    }
    else {
        if (a !== 180)
            player.sprite = sprites["pacman_o"];
        else
            player.sprite = sprites["pacman_or"];
    }
}

function drawGhosts() {
    for (var g=0; g<ghosts.length; ++g) {
    	//console.log('"ghost"+(g+1)', "ghost"+(g+1));
    	if (ghosts[g].position.x > player.position.x) {
    		ghosts[g].sprite = sprites["ghost"+(g+1)+"r"];
    	}
    	else {
    		ghosts[g].sprite = sprites["ghost"+(g+1)];
    	}
    	ghosts[g].draw();
    }
}
var dmoves = [[1,0],[0,1],[-1,0],[0,-1]];
function moveGhosts() {
	console.log('moveGhosts', 'moveGhostsFlag=',moveGhostsFlag);
	moveGhostsFlag = 0;
    for (var g=0; g<ghosts.length; ++g) {
        var dirs = getPossibleDirection(ghosts[g]);
        console.log("g=", g, "dirs=", dirs);
        console.log("dirs[ghosts[g].dir] =", dirs[ghosts[g].dir]);
        if (ghosts[g].ghostCollided() && randint(0,3) === 0)
        	ghosts[g].dir = 3;
        if (dirs[ghosts[g].dir] === 0 || randint(0,50) === 0) {
            var d = -1;
            while (d === -1) {
                var rd = randint(0,3);
                if (dirs[rd] === 1)
                    d = rd;
            }
            console.log("dirs[ghosts[g].dir] =", dirs[ghosts[g].dir], "d=", d);
            ghosts[g].dir = d;
        }
		//animate(ghosts[g], 
		//pos=(ghosts[g].x + dmoves[ghosts[g].dir][0]*20, ghosts[g].y + dmoves[ghosts[g].dir][1]*20), 
		//duration=1/SPEED, tween='linear', on_finished=flagMoveGhosts)
		ghosts[g].position.x += dmoves[ghosts[g].dir][0]*GHOST_SPEED;
		ghosts[g].position.y += dmoves[ghosts[g].dir][1]*GHOST_SPEED;
        flagMoveGhosts();
    }
}
function flagMoveGhosts() {
    moveGhostsFlag += 1;
}


function handleKeyDown(evt) {
	if (evt.repeat !== undefined) {
		if (evt.keyCode !== -1)
			keyDown = evt.keyCode;
	}
}

function handleKeyUp(evt) {
    keyDown = -1;
}

function handleMouseMove(evt) {
	mousePos = {x: evt.clientX, y: evt.clientY };
}
function handleMouseDown(evt) {
}

function handleMouseUp(evt) {
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
	// load sprites
	sprites["colourmap"] = loadSprite("images/colourmap.png");
	sprites["dot"] = loadSprite("images/dot.png");
	sprites["ghost1"] = loadSprite("images/ghost1.png");
	sprites["ghost1r"] = loadSprite("images/ghost1r.png");
	sprites["ghost2"] = loadSprite("images/ghost2.png");
	sprites["ghost2r"] = loadSprite("images/ghost2r.png");
	sprites["ghost3"] = loadSprite("images/ghost3.png");
	sprites["ghost3r"] = loadSprite("images/ghost3r.png");
	sprites["ghost4"] = loadSprite("images/ghost4.png");
	sprites["ghost4r"] = loadSprite("images/ghost4r.png");
	sprites["header"] = loadSprite("images/header.png");
	sprites["pacman_c"] = loadSprite("images/pacman_c.png");
	sprites["pacman_cr"] = loadSprite("images/pacman_cr.png");
	sprites["pacman_o"] = loadSprite("images/pacman_o.png");
	sprites["pacman_or"] = loadSprite("images/pacman_or.png");
	sprites["pacmandotmap"] = loadSprite("images/pacmandotmap.png");
	sprites["pacmanmovemap"] = loadSprite("images/pacmanmovemap.png");
	sprites["player"] = loadSprite("images/player.png");

}
function assetLoadingLoop() {
    if (spritesStillLoading > 0)
        window.requestAnimationFrame(assetLoadingLoop);
    else {
        initialize();
        mainLoop();
    }
}
function initDots() {
	pacDots = [];
	var a = 0;
    for (var x=0; x<30; ++x) {
    	for (var y=0; y<29; ++y) {
    		if (checkDotPoint({ x :10+x*20, y :10+y*20 })) {
    			pacDots.push(new Dot(sprites["dot"], { x :10+x*20, y :90+y*20 }));
    			a += 1;
    		}
    	}
    }
}

function initGhosts() {
	moveGhostsFlag = 4;
	ghosts = [];
    for (var g=0; g<4; ++g) {
    		ghosts.push(new Ghost(sprites["ghost"+(g+1)], {x:270+(g*20), y:370}));
    }
}

function inputLock() {
    player.inputActive = false;
}
function inputUnLock() {
    player.movex = 0;
    player.movey = 0;
    player.inputActive = true;
}

function checkInput() {
	
	switch (keyDown) {
	case Keys.left:
		player.angle = 180;
		player.movex = -20;
		break;
	case Keys.right:
		player.angle = 0;
		player.movex = 20;
		break;
	case Keys.up:
		player.angle = 90;
		player.movex = -20;
		break;
	case Keys.down:
		player.angle = 270;
		player.movex = 20;
		break;
	}
}

function checkMovePoint(p) {
    if (p.position.x+p.movex < 0)
    	p.position.x = p.position.x+600;
    if (p.position.x+p.movex > 600)
    	p.position.x = p.position.x-600;
    if (!isImageDataBlack(movemap, p.position.x+p.movex, p.position.y+p.movey-80)) {
        p.movex = 0;
        p.movey = 0;
    }
}

function checkDotPoint(pos) {
    if (isImageDataBlack(dotmap, pos.x, pos.y)){
        return true;
    }
    return false;
}
function getPossibleDirection(g) {
    if (g.position.x-20 < 0)
    	g.position.x = g.position.x+600;
    if (g.position.x+20 > 600)
        g.position.x = g.position.x-600;
    var directions = [0,0,0,0];
    if (g.position.x+20 < 600)
        if (isImageDataBlack(movemap, g.position.x+20, g.position.y-80))
        	directions[0] = 1;
    if (g.position.x < 600 && g.position.x >= 0)
        if (isImageDataBlack(movemap, g.position.x, g.position.y-60))
        	directions[1] = 1;
    if (g.position.x-20 >= 0)
        if (isImageDataBlack(movemap, g.position.x-20, g.position.y-80))
        	directions[2] = 1;
    if (g.position.x < 600 && g.position.x >= 0)
        if (isImageDataBlack(movemap, g.position.x, g.position.y-100))
        	directions[3] = 1;
    return directions;
}                       

function initialize() {
	
	console.log('dotmap =',dotmap);
	console.log('movemap =',movemap);
	initDots();
	initGhosts();
	
	player = new Player(sprites["pacman_o"], { x : 290, y : 570 });
	
	inputUnLock();
	// mouse initialize
    //document.onmousedown = handleMouseDown;
    //document.onmouseup = handleMouseUp;
    //document.onmousemove = handleMouseMove;
    
	// Keyboard initialize
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
	canvas.style.cursor = "default";

}
function handleInput() {
}

function mainLoop() {
    handleInput();
    update();
    
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

