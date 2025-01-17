function Farmer(){
  this.width = 16;
  this.height = 16;

  this.vel = new Vector(0, 0);
  this.pos = new Vector(0, 0);

  this.animations = {
    idle: new Animation({imageURL: "images/farmer.png"}),
    west: new Animation({imageURL: "images/farmer-walking-west.png",
      numberOfFrame: 2, type: $.gameQuery.ANIMATION_HORIZONTAL, rate: JarmView.frameRate * 10, delta: 16}),
    east: new Animation({imageURL: "images/farmer-walking-east.png",
      numberOfFrame: 2, type: $.gameQuery.ANIMATION_HORIZONTAL, rate: JarmView.frameRate * 10, delta: 16}),
    north: new Animation({imageURL: "images/farmer-walking-north.png",
      numberOfFrame: 2, type: $.gameQuery.ANIMATION_HORIZONTAL, rate: JarmView.frameRate * 10, delta: 16}),
    south: new Animation({imageURL: "images/farmer-walking-south.png",
      numberOfFrame: 2, type: $.gameQuery.ANIMATION_HORIZONTAL, rate: JarmView.frameRate * 10, delta: 16})
  };

  this.animation = this.animations.idle;

  // TODO: make more advanced inventory system
  this.inventory = [];
  this.seeds = [];
  this.money = 0;
  this.facing = "south";
}
Farmer.moveSpeed = 10;

Farmer.prototype.setPos = function(x, y){
  this.pos.x = x;
  this.pos.y = y;
}

Farmer.prototype.addItemSeeds = function(item){
  this.seeds.push(item);
};

Farmer.prototype.addItemInventory = function(item){
  this.inventory.push(item);
};

Farmer.prototype.getItemSeeds = function(which){
  return this.seeds[which];
};

Farmer.prototype.getItemInventory = function(which){
  return this.inventory[which];
};

Farmer.prototype.removeItemSeeds = function(which){
  this.seeds.splice(which, 1);
};

Farmer.prototype.removeItemInventory = function(which){
  this.inventory.splice(which, 1);
};

Farmer.prototype.getAnimation = function(){
  return this.animation;
};

Farmer.prototype.setAnimation = function(which){
  if (this.animations[which] !== undefined){
    var animation = this.animations[which];
    if (animation != this.animation){
      this.animation = animation;
      this.elem.setAnimation(animation);
    }
  }
};

Farmer.prototype.move = function(dx, dy){
  if (dx === 0 && dy === 0){
    return false;
  }

  var offset = this.elem.position();

  var newPos = this.pos.plus(dx, dy);

  // TODO: clipping has an error depending on how far out of the game world they move
  // this isn't a huge deal since the error will be small at the moment
  newPos.clip(game.worldSize, game.worldSize);

  var hit = null;
  var farmer = this;
  
  // TODO: pull this out into a function called collide()
  $.each(visibleObjects(), function(i, obj){
    if (hit !== null) { return; }

    if ($.gameQuery.rectOverlap(newPos.x, newPos.y, farmer.elem.width(), farmer.elem.height(),
        obj.position().left, obj.position().top, obj.width(), obj.height())){
      hit = obj;
    }
  });

  if (hit === null){
    this.pos = newPos;
    this.elem.offset(toWindowCoords(
      {
        left: Math.floor(this.pos.x),
        top: Math.floor(this.pos.y)
      }
    ));
    return true;
  }else{
    this.collided(hit);
  }
  return false;
};


Farmer.prototype.eachItemInventory = function(foo){
  $.each(this.inventory, foo);
};

Farmer.prototype.eachItemSeeds = function(foo){
	$.each(this.seeds, foo);
};

Farmer.prototype.moveTo = function(targetPoint, obj){
  this.targetPoint = undefined;
  this.target = undefined;

  if (targetPoint !== undefined){
    // TODO: offset this by half the width and height of the farmer so
    // that the centre of the farmer moves to the point instead of the
    // top left of the farmer
    this.targetPoint = targetPoint;
    this.vel = targetPoint.minus(this.pos).unit().times(Farmer.moveSpeed);
  }
  if (obj !== undefined){
    this.target = obj;
  }
}

Farmer.prototype.update = function(dt){
  // close enough?
  if (this.targetPoint !== undefined){
    if (this.pos.minus(this.targetPoint).normSq() <= this.vel.normSq()){
      this.arrived();
    }
  }
  if (this.target !== undefined){
    var norm = this.vel.norm();
    if ($.gameQuery.rectOverlap(this.pos.x, this.pos.y, this.elem.width(), this.elem.height(),
        this.target.position().left - norm, this.target.position().top - norm, this.target.width() + norm * 2,
        this.target.height() + norm * 2)){
      this.arrived();
    }
  }

  if (this.vel.isZero()){
    this.setAnimation("idle");
  }else{
    this.move(this.vel.x, this.vel.y);
    if (this.vel.y < -Math.abs(this.vel.x)){
      this.setAnimation("north");
    }else if (this.vel.y > Math.abs(this.vel.x)){
      this.setAnimation("south");
    }else if (this.vel.x > Math.abs(this.vel.y)){
      this.setAnimation("east");
    }else{
      this.setAnimation("west");
    }
  }
}

// Call this when the farmer arrives where he is going
Farmer.prototype.arrived = function(){
  if (this.target !== undefined){
    if (this.target.isPlot){
      activatePlot(this.target);
    }else if (this.target.isRock){
      activateRock(this.target);
    }else if (this.target.isShop){
      activateShop(this.target.shop);
    }
  }

  this.vel.zero();
  this.targetPoint = undefined;
  this.target = undefined;
}

Farmer.prototype.collided = function(collision){
  // TODO: make some sort of path-finding system to go around obstacles
  this.vel.zero();

  this.targetPoint = undefined;
  this.target = undefined;
}

Farmer.prototype.addMoney = function(amount){
  this.money += amount;
}
