function Animal(type) {
  this.ctx = SNAIL.ctx;
  this.eyesClosedImg = SNAIL.images[type + '-eyes-closed'];
  this.eyesOpenImg = SNAIL.images[type + '-eyes-open'];
  this.bodyImgs = [];
  for (var i = 0; i < 3; i++) {
    this.bodyImgs[i] = SNAIL.images[type + '-tail-' + (i + 1)];
  }
  
  this.blinking = false;
  this.firstDraw = true;
  this.aliveTime = 0;
  this.wordComplete = false;
}

Animal.prototype.draw = function(time, x, y) {
  var i = ~~(time * 0.002) % (this.bodyImgs.length * 2 - 2);
  if (i >= this.bodyImgs.length) {
    i = this.bodyImgs.length - (i - this.bodyImgs.length) - 2;
  }
  var bodyImg = this.bodyImgs[i];

  var maybeBlink = ~~(time * 0.002) % 6 === 0;
  this.blinking = maybeBlink && ~~(time * 0.01) % 3 === 0;

  var eyesImg = this.blinking ? this.eyesClosedImg : this.eyesOpenImg;

  this.ctx.save();
  if (this.firstDraw) {
    this.aliveTime++;
    var scale = this.aliveTime / 50;
    this.ctx.scale(1, scale);
    if (this.aliveTime === 50) {
      this.firstDraw = false;
    }
  }
  this.ctx.drawImage(bodyImg, x, y);
  this.ctx.drawImage(eyesImg, x, y);
  this.ctx.restore();
};
