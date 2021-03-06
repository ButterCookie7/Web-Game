
const ZERO_POS = { x : 0, y : 0 };
const FPS = 60;
const DIFFICULTY = 1
const ALIEN_SPEEDX = 0.5;
const LIVES_MAX = 3;
const TOUCH_LINE = 500;

var canvas;
var canvasContext;

//var mousePos = { x : 0, y : 0 };
var keyDown = -1;

function randint(st, end) {
	return Math.floor(Math.random() * (end-st+1) + st);
}

function Alien(sprite, pos) {
	this.sprite = sprite;
	this.position = pos;
	this.center = { x : this.sprite.width / 2, y : this.sprite.height / 2 };
	this.contains = function(p1) {
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y < p1.y && p1.y < this.position.y+this.center.y;
	};
	this.draw = function () {
		drawImage(this.sprite, this.position, 0, this.center);
	};
}
function Base(sprite, midbotPos) {
	this.height = 60;
	this.sprite = sprite;
	this.position = midbotPos;
	this.center = { x : this.sprite.width / 2, y : this.sprite.height };
	this.collidepoint = function(p1) {
		var dh = this.sprite.height - this.height;
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y+dh < p1.y && p1.y < this.position.y+this.center.y;
	};
	this.contains = function(p1) {
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y < p1.y && p1.y < this.position.y+this.center.y;
	};
	this.drawClipped = function () {
		// screen.surface.blit(self._surf, (self.x-32, self.y-self.height+30),(0,0,64,self.height))
		var dh = this.sprite.height - this.height;
		canvasContext.save();
		canvasContext.translate(this.position.x, this.position.y);
		canvasContext.drawImage(this.sprite, 0, 0, this.sprite.width, this.sprite.height,
				-this.center.x, -this.center.y+dh, this.sprite.width, this.height);
		canvasContext.restore();
	};
}
function Laser(sprite, pos) {
	this.sprite = sprite;
    this.position = pos;
    this.status = 0;
    this.type = 1;
    
	this.center = { x : this.sprite.width / 2, y : this.sprite.height / 2 };
	this.draw = function () {
		drawImage(this.sprite, this.position, 0, this.center);
	};
}
function Player() {
	this.status = 0;
	this.laserCountdown = 0;
	this.laserActive = 1;
	this.lives = LIVES_MAX;
	this.name = "";
	
	this.position = { x : 400, y : 550 };
	this.size = { x : playerSprites[0].width, y : playerSprites[0].height };
	this.center = { x : playerSprites[0].width / 2, y : playerSprites[0].height / 2 };

	this.draw = function () {
		drawImage(playerSprites[Math.floor(this.status/6)], this.position, 0, this.center);
	};
	this.contains = function(p1) {
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y < p1.y && p1.y < this.position.y+this.center.y;
	};

}
function Boss(sprite, pos) {
	this.sprite = sprite;
    this.position = pos;
    this.active = false;
    this.direction = 0;
    
	this.center = { x : this.sprite.width / 2, y : this.sprite.height / 2 };
	this.draw = function () {
		drawImage(this.sprite, this.position, 0, this.center);
	};
	this.contains = function(p1) {
		return this.position.x-this.center.x < p1.x && p1.x < this.position.x+this.center.x
		&& this.position.y-this.center.y < p1.y && p1.y < this.position.y+this.center.y;
	};
}
function Life(sprite, pos) {
	this.sprite = sprite;
    this.position = pos;
	this.center = { x : this.sprite.width / 2, y : this.sprite.height / 2 };
	this.draw = function () {
		drawImage(this.sprite, this.position, 0, ZERO_POS);
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

var gameStatus = 0;
var highScore = [];
var level = 1;
var player;
var aliens = [];
var bases = [];
var boss;
var lives = [];

var lasers = [];
var moveCounter = 0;
var moveSequence = 0;
var moveDelay = FPS/2;;

var score = 0;

var movex = 0;
var movey = 0;

var topScoreList = undefined;

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
	drawText('scoreArea', '');
	drawText('levelArea', '');
	drawText('topScoreArea', '');
	drawText('topListArea', '');
	drawText('nameArea', '');
	drawText('footArea', '');
}

function draw() {

	clearCanvas();
	clearTexts();
	drawImage(sprites['background'], ZERO_POS, 0, ZERO_POS);
	
    if (gameStatus === 0) {
    	// display the title page
    	drawText('textArea', "PYGAME ZERO INVADERS<br><br><br>Type your name then<br>"
    			+"press Enter to start<br>(arrow keys move, space to fire)");
    	drawText('nameArea', player.name);
    }
    if (gameStatus === 1) {
    	player.draw();

    	if (boss.active)
    		boss.draw();
    	drawLasers();
    	drawAliens();
    	drawBases();

    	drawText('scoreArea', score);
    	drawText('levelArea', "LEVEL " + level);
    	drawLives();
    	
    	if (player.status >= 30) {
    		if (player.lives > 0) {
    			drawText('textArea', "YOU WERE HIT!<br>Press Enter to re-spawn");
    		}
    		else {
    			drawText('textArea', "GAME OVER!<br>Press Enter to continue");
    		}
    	}
    	if (aliens.length === 0) {
    		drawText('textArea', "LEVEL CLEARED!<br>Press Enter to go to the next level");
    	}
    }
    if (gameStatus === 2) {
    	// game over show the leaderboard
    	drawHighScore()
    }
}

function drawAliens() {
    for (var a=0; a<aliens.length; ++a)
    	aliens[a].draw();
}

function drawBases() {
    for (var b=0; b<bases.length; ++b) {
    	bases[b].drawClipped()
    }
}

function drawLasers() {
    for (var l=0; l<lasers.length; ++l) {
    	lasers[l].draw();
    }
}

function drawLives() {
	for (var i=0; i<player.lives; ++i) {
		lives[i].draw();
	}
}
function drawHighScore() {
	clearTexts();
	drawText('topScoreArea', "TOP SCORES");
    var topList = '';
    for (var y = 0; y < highScore.length; ++y) {
    	var line = highScore[y];
        if (y < 400) {
        	topList += (line + '<br>');
        }
    }
	drawText('topListArea', topList);

	drawText("footArea", "Press Escape to play again");
}

function update() {

	if (gameStatus === 0) {
		if (keyDown === Keys.enter && player.name != "") {
			gameStatus = 1;
		}
	}
	if (gameStatus === 1) {
		if (player.status < 30 && aliens.length > 0) {
			checkKeys();
			checkBases();
			updateLasers();
			updateBoss();
			updateAliens();
			if (player.status > 0) {
				player.status += 1;
                if (player.status === 30) {
                    player.lives -= 1;
                }
			} 
		}
		else {
			if (keyDown === Keys.enter) {
				if (player.lives > 0) {
                    player.status = 0;
                    lasers = [];
                    if (aliens.length === 0) {
                        level += 1;
                        boss.active = false;
                        initAliens();
                        initBases();
                    }
				}
				else {
                    readHighScore();
                    gameStatus = 2;
				}
			}
		}
	}
	if (gameStatus === 2) {
		if (keyDown === Keys.escape) {
			initialize();
			gameStatus = 0;
		}
	}
}

function readHighScore() {
	highScore.push(score + " " + player.name);
	highScore.sort(function(sco1, sco2){
		var isco1 = parseInt(sco1.substring(0, sco1.indexOf(" ")));
		var isco2 = parseInt(sco2.substring(0, sco2.indexOf(" ")));
		return isco1 - isco2;
	});
	highScore.reverse();
}

function checkKeys() {
	
	switch (keyDown) {
	case Keys.left:
		if (player.position.x > 40)
			player.position.x -= 5;
		break;
	case Keys.right:
		if (player.position.x < 760)
			player.position.x += 5;
		break;
	case Keys.space:
        if (player.laserActive === 1) {
            player.laserActive = 0;
            window.setTimeout(makeLaserActive, 1.0*1000);
            l = lasers.length;
            lasers.push(new Laser(sprites["laser2"], { x : player.position.x, y : player.position.y-32}));
            lasers[l].status = 0;
            lasers[l].type = 1;
        }		
	}
}
function makeLaserActive() {
    player.laserActive = 1;
}

function checkBases() {
	for (var b=0; b<bases.length; ++b) {
		//console.log("bases[b].height=", bases[b].height, "bases.length", bases.length);
        if (bases[b].height < 5) {
        	// remove bases[b] from bases
        	var ind = bases.indexOf(bases[b]);
    		//console.log("ind=", ind, "bases.length", bases.length);
        	if (ind !== -1) {
        		bases.splice(ind, 1);
        		//console.log("ind=", ind, "bases.length", bases.length);
        	}
        }
	}
}
function listCleanup(li) {
    var newList = [];
    for (var i=0; i< li.length; ++i) {
        if (li[i].status === 0)
        	newList.push(li[i]);
    }
    return newList;
}

function checkLaserHit(l) {
    if (player.contains({x: lasers[l].position.x, y: lasers[l].position.y+lasers[l].center.y})) {
    	sounds["explosion"].play();
        player.status = 1;
        lasers[l].status = 1;
    }
    for (var b=0; b<bases.length; ++b) {
        if (bases[b].collidepoint({x: lasers[l].position.x, y: lasers[l].position.y+lasers[l].center.y})) {
            bases[b].height -= 10;
            lasers[l].status = 1;
        }
    }
}

function checkPlayerLaserHit(l) {
    for (var b=0; b<bases.length; ++b) {
        if (bases[b].contains(lasers[l].position)){
        	lasers[l].status = 1;
        }
    }
    for (var a=0; a<aliens.length; ++a) {
        if (aliens[a].contains({ x: lasers[l].position.x, y: lasers[l].position.y-lasers[l].center.y})){
            lasers[l].status = 1;
            aliens[a].status = 1;
            score += 1000;
        }
    }
    if (boss.active) {
        if (boss.contains({ x: lasers[l].position.x, y: lasers[l].position.y-lasers[l].center.y})) {
            lasers[l].status = 1;
            boss.active = false;
            score += 5000;
        }
    }
}

function updateLasers() {
	for (var l=0; l<lasers.length; ++l) {
        if (lasers[l].type === 0) {
            lasers[l].position.y += (2*DIFFICULTY);
            checkLaserHit(l);
            if (lasers[l].position.y > TOUCH_LINE+100)
            	lasers[l].status = 1;
        }
        if (lasers[l].type === 1) {
            lasers[l].position.y -= 5;
            checkPlayerLaserHit(l);
            if (lasers[l].position.y < 10)
            	lasers[l].status = 1;
        }
	}
    lasers = listCleanup(lasers);
    aliens = listCleanup(aliens);	
}

function updateAliens() {
	if (moveSequence < 10 || moveSequence > 30) {
		movex = -ALIEN_SPEEDX;
	}
	if (moveSequence >10 && moveSequence < 30) {
		movex = ALIEN_SPEEDX;
	}
	moveCounter += 1;
	if (moveCounter < moveDelay) { 
		// update only pos x
		for (var a=0; a<aliens.length; ++a) {
			aliens[a].position.x += movex;
		}
	}
	else { // 0.5 sec period
		// update pos (x,y)
		moveCounter = 0;    
		movey = 0;
		if (moveSequence === 10 || moveSequence === 30) {
			movey = 50 + (10 * DIFFICULTY);
			moveDelay -= 1;
		}
		for (var a=0; a<aliens.length; ++a) {
			aliens[a].position = {x: aliens[a].position.x, y: aliens[a].position.y + movey};
			if (randint(0, 1) === 0) {
				aliens[a].sprite = sprites["alien1"];
			}
			else {
				aliens[a].sprite = sprites["alien1b"];
				if (randint(0, 5) === 0 ) {
					var laser = new Laser(sprites["laser1"], { x: aliens[a].position.x, y: aliens[a].position.y});
					laser.status = 0;
					laser.type = 0;
					lasers.push(laser);
					sounds["laser"].play();
				}
			}
			if (aliens[a].position.y > TOUCH_LINE && player.status === 0) {
				sounds["explosion"].play();
				player.status = 1;
			}
		}
		moveSequence +=1;
		if (moveSequence === 40)
			moveSequence = 0;
	}
}

function updateBoss() {
    if (boss.active) {
        boss.position.y += (0.3*level);
        if (boss.direction === 0)
        	boss.position.x -= (1* level);
        else
        	boss.position.x += (1* level);
        if (boss.position.x < 100)
        	boss.direction = 1;
        if (boss.position.x > 700)
        	boss.direction = 0;
        if (boss.position.y > TOUCH_LINE) {
            sounds["explosion"].play();
            player.status = 1;
            boss.active = false;
        }
        if (randint(0, 30) === 0) {
        	var laser = new Laser(sprites["laser1"], { x: boss.position.x, y: boss.position.y})
            laser.status = 0;
            laser.type = 0;
            lasers.push(laser);
        }
    }
    else {
        if (randint(0, 800) == 0) {
            boss.active = true;
            boss.position.x = 800;
            boss.position.y = 100;
            boss.direction = 0;
        }
    }
}

function handleKeyDown(evt) {
	if (evt.repeat !== undefined) {
		if (evt.keyCode !== -1)
			keyDown = evt.keyCode;
	}
	if (gameStatus === 0) {
		if (keyDown >= Keys.space && keyDown <= Keys.Z) {
			player.name += String.fromCharCode(keyDown);
		}
		else if (keyDown === Keys.back) {
			player.name = player.name.slice(-1);
		}
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
	sprites["alien1"] = loadSprite("images/alien1.png");
	sprites["alien1b"] = loadSprite("images/alien1b.png");
	sprites["background"] = loadSprite("images/background.png");
	sprites["base1"] = loadSprite("images/base1.png");
	sprites["boss"] = loadSprite("images/boss.png");
	sprites["explosion1"] = loadSprite("images/explosion1.png");
	sprites["explosion2"] = loadSprite("images/explosion2.png");
	sprites["explosion3"] = loadSprite("images/explosion3.png");
	sprites["explosion4"] = loadSprite("images/explosion4.png");
	sprites["explosion5"] = loadSprite("images/explosion5.png");
	sprites["laser1"] = loadSprite("images/laser1.png");
	sprites["laser2"] = loadSprite("images/laser2.png");
	sprites["life"] = loadSprite("images/life.png");
	sprites["player"] = loadSprite("images/player.png");
	// load sounds
	sounds["explosion"] = new Sound("sounds/explosion.ogg");
	sounds["gun"] = new Sound("sounds/gun.ogg");
	sounds["laser"] = new Sound("sounds/laser.ogg");

}
function assetLoadingLoop() {
    if (spritesStillLoading > 0)
        window.requestAnimationFrame(assetLoadingLoop);
    else {
        initialize();
        mainLoop();
    }
}
function initAliens() {
    aliens = [];
    for (var a=0; a<18; ++a) {
        aliens.push(new Alien(sprites["alien1"], { x :210+(a % 6)*80, y :100+(Math.floor(a/6)*64) }));
        aliens[a].status = 0;
    }
}

function initBases() {
	bases = [];
	bc = 0;
    for (var b=0; b<3; ++b) {
    	for (var p=0; p<3; ++p) {
            bases.push(new Base(sprites["base1"], {x:150+(b*200)+(p*40), y:520}));
            bases[bc].height = 60;
            bc +=1;
    	}
    }
}

function initialize() {
	playerSprites = [sprites["player"], sprites["explosion1"], sprites["explosion2"], 
		sprites["explosion3"], sprites["explosion4"], sprites["explosion5"]];
	
	initAliens();
	initBases();
	
	moveCounter = 0;
	moveSequence = 0;
	score = 0;
	
	lasers = [];
	moveDelay = 30;
	player = new Player();
	player.status = 0;
	player.laserActive = 1;
	player.laserCountdown = 0;
	
	boss = new Boss(sprites["boss"], ZERO_POS);
	boss.active = false;
	
	for (var i=0; i<LIVES_MAX; ++i) {
		lives.push(new Life(sprites["life"], {x: 10+(i*32), y: 10}));
	}
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

