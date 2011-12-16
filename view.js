function JarmView(){
  $.gameQuery.LockedView.call(this, game.farmer.elem, $.playground(), game.background, {
    width: game.worldSize,
    height: game.worldSize,
    imageURL: "images/grass.jpg"
  });

  // update rate happens less often since it isn't necessary
  this.updateRate = 1000 / 10;

  // message queue related
  this.messages = [];
  this.msgThreshold = 3000;
  this.msgLastDraw = null;

  this.drawInventory();
  this.drawSeeds();
}
JarmView.prototype = $.gameQuery.LockedView.prototype;

JarmView.frameRate = 1000 / 50;

JarmView.prototype.update = function(){
  var now = new Date().getTime();

  if (this.msgLastDraw === null || this.msgLastDraw + 1000 < now){
    this.drawMessages();
    this.msgLastDraw = now;
  }
}

JarmView.prototype.drawMessages = function(){
  var current;
  var text = "";
  var now = new Date().getTime();

  while (this.messages.length > 5 || (this.messages.length > 0 && now - this.messages[0].timestamp > this.msgThreshold)){
    this.messages.shift();
  }

  if (this.messages.length === 0){
    $("#msg").html("").hide();
  }else{
    text = mapJoin(this.messages, "<br />", function(obj) { return obj.message; });
    $("#msg").html(text).show();
  }

}

JarmView.prototype.drawInventory = function(){
  var current;
  var text = "";

  if (game.farmer.inventory.length === 0){
    text = "<i>Nothing</i>";
  }else{
    text = mapJoin(game.farmer.inventory, "<br />", function(obj) { return obj.name; });
  }

  $("#inventory").html(text);
  $("#money").html(game.farmer.money);
}

JarmView.prototype.drawSeeds = function(){
  var current;
  var text = "";

  if (game.farmer.seeds.length === 0){
    text = "<i>Nothing</i>";
  }else{
    text = mapJoin(game.farmer.seeds, "<br />", function(obj) { return obj.name; });
  }

  $("#seeds").html(text);
  $("#money").html(game.farmer.money);
}

JarmView.prototype.addMessage = function(message){
  this.messages.push({
    message: message,
    timestamp: new Date().getTime()
  });
  this.drawMessages();
}
