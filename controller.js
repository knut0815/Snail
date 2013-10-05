var SNAIL = {}; //Main namespace

SNAIL.canvasID = "#gameCanvas";
SNAIL.staticBlocks = [];
SNAIL.lastFrameTime = 0;

SNAIL.blockWidth  = 48;
SNAIL.blockHeight = 48;

SNAIL.numBlocksWidth  = 100;
SNAIL.numBlocksHeight = 30;

// Width only needs to be as big as the view.
SNAIL.canvasRenderWidth  = SNAIL.numBlocksHeight  * SNAIL.blockWidth;
SNAIL.canvasRenderHeight = SNAIL.numBlocksHeight * SNAIL.blockHeight;

SNAIL.level = 0;
SNAIL.currentText = "";
SNAIL.matches = [];
SNAIL.gravity = .8;

SNAIL.startGame = function(){
	SNAIL.canvas = $(SNAIL.canvasID)[0];
  // SNAIL.canvas.width = SNAIL.canvasRenderWidth;
  // SNAIL.canvas.height = SNAIL.canvasRenderHeight;
	SNAIL.ctx = SNAIL.canvas.getContext('2d');

	SNAIL.canvas.width = window.innerWidth;
	SNAIL.canvas.height = window.innerHeight;

	SNAIL.initEvents();
	SNAIL.initBlocks();

	SNAIL.player.init(0,48*4);
};

SNAIL.initBlocks = function(){

	for (var x = 0; x < SNAIL.numBlocksWidth; x++) {
		// SNAIL.staticBlocks.push(['A',0,0,0,0,0,0,'B']);
		if (x % 4 == 0) {
	      SNAIL.staticBlocks.push(['C','A','E','P',0,0,'B','A']);
	    } else {
	    	if(Math.random() < 0.2){
		      SNAIL.staticBlocks.push(['C','A','E','P',0,0,0,'A']);

		  }else{
		      SNAIL.staticBlocks.push(['C','A','E',0,0,0,0,'A']);
		  }
	    }
	}

};

SNAIL.animloop = function(time){
    SNAIL.render();

    var dt = time - SNAIL.lastFrameTime;
	SNAIL.updateModel(dt);

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

SNAIL.render = function(){
	SNAIL.drawBackground();
	SNAIL.drawMap(-SNAIL.player.x+SNAIL.canvas.width/2,0);
	SNAIL.player.draw(SNAIL.canvas.width/2,SNAIL.player.y);
};

SNAIL.loadImages = function(callback) {
  var funcs = [];
  for (var key in SNAIL.images) {
    funcs.push(getImage(key, SNAIL.images[key]));
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

function getImage(key, url) {
  return function(callback) {
    var img = new Image();
    img.src = 'images/' + url + '.png';
    img.onload = function() {
      callback(null, key, img);
    };
    img.onerror = callback;
  };
}

SNAIL.updateModel = function(dt){

	//SNAIL.player.update(dt/1000*60);

	//Random
	//SNAIL.staticBlocks[8*Math.random()|0][8*Math.random()|0] = Math.random() < 0.5 ? 'C' : 'B';

	SNAIL.player.update(1);
	// console.log(dt);

};

SNAIL.drawBackground = function() {
  SNAIL.ctx.clearRect(0, 0, SNAIL.canvas.width, SNAIL.canvas.height);
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
		SNAIL.currentText = "";
	}else{
		if(matchedWordCompletely){
			console.log("completly!");

			SNAIL.currentText = "";
		}else{
			console.log(matches,"matching... keep going!");
		}
	}

	if(matchesWord){
		SNAIL.currentText += letter;
	}

	SNAIL.matches = matches;
};

SNAIL.staticCollision = function(x, y, dx, dy) {
  var cellX = ~~(x/SNAIL.blockWidth);
  var cellY = ~~(y/SNAIL.blockHeight);

  for (var i = cellX-1; i < cellX+2; i++) {
    for (var j = cellY-1; j < cellY+2; j++) {
      if (i > -1 && j > -1 && i < SNAIL.numBlocksWidth && j < SNAIL.numBlocksHeight && SNAIL.staticBlocks[i][j]) {
        var vx = x-i*SNAIL.blockWidth;
        var vy = y-j*SNAIL.blockHeight;
        if (vx > -SNAIL.blockWidth && vx < SNAIL.blockWidth && vy > -SNAIL.blockHeight && vy < SNAIL.blockHeight) {
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
};

SNAIL.mousemove = function(x,y){

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
