var SNAIL = {}; //Main namespace

SNAIL.canvasID = "#gameCanvas";
SNAIL.wordsCanvasID = "#wordsCanvas";
SNAIL.staticBlocks = [];
SNAIL.lastFrameTime = 0;

SNAIL.blockWidth  = 48;
SNAIL.blockHeight = 48;

SNAIL.numBlocksWidth  = 100;
SNAIL.numBlocksHeight = 30;

// Width only needs to be as big as the view.
SNAIL.canvasRenderWidth  = SNAIL.numBlocksHeight  * SNAIL.blockWidth;
SNAIL.canvasRenderHeight = SNAIL.numBlocksHeight * SNAIL.blockHeight;

SNAIL.dirtyWordsCanvas = true;
SNAIL.level = 0;
SNAIL.currentText = "";
SNAIL.matches = [];
SNAIL.gravity = .8;
SNAIL.bgColor = '#fff';

// Variables for editor
SNAIL.edit = true;
SNAIL.currentBlock = 0;

SNAIL.startGame = function(){
	SNAIL.loadImageData();

	SNAIL.canvas = $(SNAIL.canvasID)[0];
	// SNAIL.wordsCanvas = $(SNAIL.wordsCanvasID)[0];
  // SNAIL.canvas.width = SNAIL.canvasRenderWidth;
  // SNAIL.canvas.height = SNAIL.canvasRenderHeight;
	SNAIL.ctx = SNAIL.canvas.getContext('2d');
	// SNAIL.wordsctx = SNAIL.wordsCanvas.getContext('2d');
	// SNAIL.wordsCanvas.width = 800;
	// SNAIL.wordsCanvas.height = SNAIL.canvasRenderHeight;

	SNAIL.canvas.width = window.innerWidth;
	SNAIL.canvas.height = window.innerHeight;

	SNAIL.initEvents();
	SNAIL.initBlocks();

	SNAIL.player.init(48,1344);
  SNAIL.dog = new Animal('dog');
  SNAIL.cat = new Animal('cat');

SNAIL.initBlocks = function(){
  SNAIL.staticBlocks = SNAIL.levelData;
};

SNAIL.animloop = function(time){
    SNAIL.render(time);

    var dt = time - SNAIL.lastFrameTime;
	SNAIL.updateModel(dt, time);

	SNAIL.lastFrameTime = time;
    requestNextAnimationFrame(SNAIL.animloop);
};

SNAIL.main = function(){
  SNAIL.loadImages(function() {
    SNAIL.startGame();
    requestNextAnimationFrame(SNAIL.animloop);
  });
};
window.onload = SNAIL.main;

SNAIL.render = function(time){
	SNAIL.drawBackground(time);
	
  if (SNAIL.edit) {
    SNAIL.player.draw(time, SNAIL.canvas.width/2,SNAIL.canvas.height/2);
    SNAIL.drawMap(-SNAIL.player.x+SNAIL.canvas.width/2,-SNAIL.player.y+SNAIL.canvas.height/2);
  } else {
    SNAIL.player.draw(time, SNAIL.canvas.width/2,SNAIL.player.y);
    SNAIL.drawMap(-SNAIL.player.x+SNAIL.canvas.width/2,0);
  }

  if (SNAIL.edit) {
    var length = SNAIL.imageFiles.length;
    var columns = ~~(SNAIL.canvas.width/SNAIL.blockWidth);
    var rows = ~~(length/columns)+1;

    for (var i in SNAIL.imageFiles) {
      var block = SNAIL.images[SNAIL.imageFiles[i]];
      if (typeof block == 'object') {
        SNAIL.ctx.drawImage(block, (i%columns)*SNAIL.blockWidth, SNAIL.canvas.height+SNAIL.blockHeight*(~~(i/columns)-rows));
      }
    }
  }
	if(true||SNAIL.dirtyWordsCanvas){
		SNAIL.dirtyWordsCanvas = false;
		SNAIL.drawWords(0,0+SNAIL.blockHeight*0.5|0)
	}
};

SNAIL.drawWords = function(offX,offY){
	var currentText = SNAIL.currentText;
	// SNAIL.wordsctx.clearRect(0, 0, SNAIL.wordsCanvas.width, SNAIL.wordsCanvas.height);

	if(SNAIL.matches.length == 0){
		for(var i = 0; i < SNAIL.levelWords[SNAIL.level].length; i++){
			SNAIL.matches[i] = i;
		}
	}

	var numWords = SNAIL.matches.length;//SNAIL.levelWords[SNAIL.level].length;
	// console.log(SNAIL.matches,SNAIL.currentText)

	SNAIL.ctx.save();
	for(var i = 0; i < SNAIL.levelWords[SNAIL.level].length; i++){
		var word = SNAIL.levelWords[SNAIL.level][i];
		for(var j = 0; j < word.length; j++){
			var block = SNAIL.images[word[j].toUpperCase()];
			if (typeof block == 'object') {
				var imgX = j * SNAIL.blockWidth;
				var imgY = i * SNAIL.blockHeight;
				if(SNAIL.matches.indexOf(i) >= 0 && word[j] == currentText[j]){
					
					//Draw set block here
					var block = SNAIL.images[word[j].toUpperCase()+'P'];
					if (typeof block == 'object') {
						SNAIL.ctx.drawImage(block, imgX+offX, imgY+offY);
					}
				}else{
					SNAIL.ctx.drawImage(block, imgX+offX, imgY+offY);
					if(SNAIL.matches.indexOf(i) < 0){
						SNAIL.ctx.fillStyle = 'rgba(255,0,0,0.4)';
					}else{
						SNAIL.ctx.fillStyle = 'rgba(255,255,255,0.4)';
					}
					SNAIL.ctx.fillRect(imgX+offX, imgY+offY, SNAIL.blockWidth, SNAIL.blockHeight);					
				}
			}
		}
	}
	SNAIL.ctx.restore();

	for(var i = 0; i < SNAIL.levelWords[SNAIL.level].length; i++){
		var word = SNAIL.levelWords[SNAIL.level][i];
		for(var j = currentText.length; j < word.length && SNAIL.matches.indexOf(i) >= 0; j++){
			var block = SNAIL.images[word[j].toUpperCase()];
			if (typeof block == 'object') {
				var imgX = j * SNAIL.blockWidth;
				var imgY = i * SNAIL.blockHeight;
				SNAIL.ctx.drawImage(block, imgX+offX, imgY+offY);
			}
		}
	}
};

SNAIL.loadImageData = function(){
	// var tmpCanvas = document.createElement('canvas');
	// var context = tmpCanvas.getContext('2d');
	// for(key in SNAIL.images){
	// 	var image = SNAIL.images[key];
	// 	console.log(image);

 //        var imageWidth = image.width;
 //        var imageHeight = image.height;

 //        context.drawImage(image, 0, 0);

 //        var imageData = context.getImageData(0, 0, imageWidth, imageHeight);
 //        var data = imageData.data;
	// }
}

SNAIL.loadImages = function(callback) {
  var funcs = [];
  for (var i = 0, len = SNAIL.imageFiles.length; i < len; i++) {
    funcs.push(getImage(SNAIL.imageFiles[i]));
  }

  (function next() {
    var fn = funcs.shift();
    fn(function(err, key, img) {
      if (err) {
        console.error(err);
      } else {
        SNAIL.images[key] = img;
      }
      if (funcs.length) {
        next();
      } else {
        callback();
      }
    });
  })();
};

function getImage(key) {
  return function(callback) {
    var img = new Image();
    img.src = 'images/' + key + '.png';
    img.onload = function() {
      callback(null, key, img);
    };
    img.onerror = callback;
  };
}

SNAIL.updateModel = function(dt, time){

	//SNAIL.player.update(dt/1000*60);

	//Random
	//SNAIL.staticBlocks[8*Math.random()|0][8*Math.random()|0] = Math.random() < 0.5 ? 'C' : 'B';

	SNAIL.player.update(1, time);
	// console.log(dt);

};

SNAIL.drawBackground = function(time) {
  var ctx = SNAIL.ctx;
  ctx.fillStyle = SNAIL.bgColor;
  ctx.fillRect(0, 0, SNAIL.canvas.width, SNAIL.canvas.height);
  SNAIL.drawRectBackground(time);
};

SNAIL.drawRectBackground = function(time) {
  var ctx = SNAIL.ctx;
  var width = SNAIL.canvas.width;
  var height = SNAIL.canvas.height;
  var ratio = width / height;
  var midWidth = width / 2;
  var sect = 40;
  var lenx = width / sect;
  var leny = height / sect;
  var n = 0;
  time = time * 0.005 + SNAIL.player.distance * 0.1;
  var lenx2 = lenx * 2;
  var startx = -time % lenx2;
  var starty = startx / ratio;

  do {
    ctx.fillStyle = n % 2 === 0 ? '#BDBDBD' : '#A9BCF5';
    var x1 = startx + lenx * n;
    var y1 = starty + leny * n;
    var x2 = width - x1 * 2;
    var y2 = height - y1 * 2;
    ctx.fillRect(x1, y1, x2, y2);
    n++;
  } while (x1 < midWidth);
};

SNAIL.drawMap = function(offX,offY) {
  for (var x = 0; x < SNAIL.numBlocksWidth; x++) {
    for (var y = 0; y < SNAIL.numBlocksHeight; y++) {
      var block = SNAIL.images[SNAIL.staticBlocks[x][y]];
      if (typeof block == 'object') {
        var imgX = x * SNAIL.blockWidth;
        var imgY = y * SNAIL.blockHeight;
        SNAIL.ctx.drawImage(block, imgX+offX, imgY+offY);
      }
    }
  }
};

// *** Game Progress Events *** //
SNAIL.hitLetter = function(letter){

	if(typeof letter != 'string' || letter.length != 1 || letter.charCodeAt(0) < 65 || letter.charCodeAt(0) > 90){
		return;
	}

	if(letter == SNAIL.currentText[SNAIL.currentText.length-1]){
		return;
	}
	
	console.log("Hit letter: " + letter);

	var words = SNAIL.levelWords[SNAIL.level];
	var isMatch = false;
	var matches = [];
	for(var i = 0; i < words.length; i++){
		var word = words[i];
		var newText = SNAIL.currentText + letter;
		
		// console.log(word);
		var matchesWord = true;
		var matchedWordCompletely = true;
		for(var j = 0; j < word.length && j < newText.length; j++){
			if(newText[j] != word[j]){
				matchesWord = false;
			}
		}

		if(matchesWord){
			isMatch = true;
			matches.push(i);
		}

		if(!matchesWord || newText.length < word.length){
			matchedWordCompletely = false;
		}else{
			break;
		}
	}
	
	if(!isMatch){
		console.log("failure :(");
		SNAIL.player.state = "sad";
		SNAIL.currentText = "";
	}else{
		if(matchedWordCompletely){
			console.log("completly!");
			SNAIL.player.state = "happy";

			SNAIL.level++;
			matches = [];
			SNAIL.currentText = "";
		}else{
			SNAIL.currentText = SNAIL.currentText+letter;
			SNAIL.player.state = "happy";
			console.log(matches,"matching... keep going!");
		}
	}

	SNAIL.matches = matches;
	SNAIL.dirtyWordsCanvas = true;

};

SNAIL.staticCollision = function(x, y, dx, dy, letterEvent) {
  var cellX = ~~(x/SNAIL.blockWidth);
  var cellY = ~~(y/SNAIL.blockHeight);

  for (var i = cellX-1; i < cellX+2; i++) {
    for (var j = cellY-1; j < cellY+2; j++) {
      if (i > -1 && j > -1 && i < SNAIL.numBlocksWidth && j < SNAIL.numBlocksHeight && (block = SNAIL.staticBlocks[i][j]) && block.indexOf('grass-top') == -1) {
        var vx = x-i*SNAIL.blockWidth;
        var vy = y-j*SNAIL.blockHeight;
        if (vx > -SNAIL.blockWidth && vx < SNAIL.blockWidth && vy > -SNAIL.blockHeight && vy < SNAIL.blockHeight) {
          if (letterEvent && block.length == 1) {
            SNAIL.hitLetter(block);
          }
          if (Math.abs(vx) > Math.abs(vy-dy-SNAIL.gravity)) {
            if (vx < 0) {
              x -= SNAIL.blockWidth+vx;
            } else {
              x += SNAIL.blockWidth-vx;
            }
          } else {
            if (vy < 0) {
              y -= SNAIL.blockHeight+vy;
            } else {
              y += SNAIL.blockHeight-vy;
            }
          }
        }
      }
    }
  }
  return [x, y]
}

// **** EVENTS **** //
SNAIL.mouseState = 'up';

SNAIL.movePlayer = function(direction){
	console.log("Move: " + direction);
};

SNAIL.mouseup = function(x,y){
	SNAIL.mouseState = 'up';
};

SNAIL.mousedown = function(x,y){
	SNAIL.mouseState = 'down';

  if (SNAIL.edit) {
    var length = SNAIL.imageFiles.length;
    var columns = ~~(SNAIL.canvas.width/SNAIL.blockWidth);
    var rows = ~~(length/columns)+1;

    var panel = SNAIL.canvas.height-rows*SNAIL.blockHeight;
    if (y > panel) {
      

      var column = ~~(x/SNAIL.blockWidth);
      var row = ~~((y-panel)/SNAIL.blockHeight);

      SNAIL.currentBlock = SNAIL.imageFiles[column+row*columns] || 0;
    } else {
      var cellX = ~~((x+SNAIL.player.x-SNAIL.canvas.width/2)/SNAIL.blockWidth);
      var cellY = ~~((y+SNAIL.player.y-SNAIL.canvas.height/2)/SNAIL.blockHeight);
      SNAIL.staticBlocks[cellX][cellY] = SNAIL.currentBlock;
    }
  }
};

SNAIL.mousemove = function(x,y){
  if (SNAIL.mouseState == 'down' && SNAIL.edit) {
    var length = SNAIL.imageFiles.length;
    var columns = ~~(SNAIL.canvas.width/SNAIL.blockWidth);
    var rows = ~~(length/columns)+1;

    var panel = SNAIL.canvas.height-rows*SNAIL.blockHeight;
    if (y < panel) {
      var cellX = ~~((x+SNAIL.player.x-SNAIL.canvas.width/2)/SNAIL.blockWidth);
      var cellY = ~~((y+SNAIL.player.y-SNAIL.canvas.height/2)/SNAIL.blockHeight);
      SNAIL.staticBlocks[cellX][cellY] = SNAIL.currentBlock;
    }
  }
};

SNAIL.initEvents = function(){
	$(document).mouseup(function (e) {
		var offset = $(SNAIL.canvasID).offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;
		SNAIL.mouseup(x,y);
	});

	$(document).mousedown(function (e) {
		var offset = $(SNAIL.canvasID).offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;
		SNAIL.mousedown(x,y);
	});

	$(document).mousemove(function (e) {
		var offset = $(SNAIL.canvasID).offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;
		SNAIL.mousemove(x,y);
	});

	$(document).keydown(function (e) {
		if(e.which == 37){
      SNAIL.player.moveLeft = true;
		}else if(e.which == 39){
      SNAIL.player.moveRight = true;
		}else if(e.which == 38){
			SNAIL.player.jump = true;
		}else if(e.which == 40){
			SNAIL.movePlayer('down');
		}
	});
  $(document).keyup(function (e) {
    if(e.which == 37){
      SNAIL.player.moveLeft = false;
    }else if(e.which == 39){
      SNAIL.player.moveRight = false;
    }else if(e.which == 38){
      SNAIL.player.jump = false;
    }else if(e.which == 40){
      SNAIL.movePlayer('down');
    }
  });
};

// Reprinted from Core HTML5 Canvas
// By David Geary
window.requestNextAnimationFrame =
   (function () {
      var originalWebkitRequestAnimationFrame = undefined,
          wrapper = undefined,
          callback = undefined,
          geckoVersion = 0,
          userAgent = navigator.userAgent,
          index = 0,
          self = this;

      // Workaround for Chrome 10 bug where Chrome
      // does not pass the time to the animation function
      
      if (window.webkitRequestAnimationFrame) {
         // Define the wrapper

         wrapper = function (time) {
           if (time === undefined) {
              time = +new Date();
           }
           self.callback(time);
         };

         // Make the switch
          
         originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;    

         window.webkitRequestAnimationFrame = function (callback, element) {
            self.callback = callback;

            // Browser calls the wrapper and wrapper calls the callback
            
            originalWebkitRequestAnimationFrame(wrapper, element);
         }
      }

      // Workaround for Gecko 2.0, which has a bug in
      // mozRequestAnimationFrame() that restricts animations
      // to 30-40 fps.

      if (window.mozRequestAnimationFrame) {
         // Check the Gecko version. Gecko is used by browsers
         // other than Firefox. Gecko 2.0 corresponds to
         // Firefox 4.0.
         
         index = userAgent.indexOf('rv:');

         if (userAgent.indexOf('Gecko') != -1) {
            geckoVersion = userAgent.substr(index + 3, 3);

            if (geckoVersion === '2.0') {
               // Forces the return statement to fall through
               // to the setTimeout() function.

               window.mozRequestAnimationFrame = undefined;
            }
         }
      }
      
      return window.requestAnimationFrame   ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame    ||
         window.oRequestAnimationFrame      ||
         window.msRequestAnimationFrame     ||

         function (callback, element) {
            var start,
                finish;


            window.setTimeout( function () {
               start = +new Date();
               callback(start);
               finish = +new Date();

               self.timeout = 1000 / 60 - (finish - start);

            }, self.timeout);
         };
      }
   )
();
