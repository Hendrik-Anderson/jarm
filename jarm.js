var Animation = $.gameQuery.Animation;
var keycodes = $.gameQuery.keycodes;
var keyTracker;

var game = {
  background: null,
  playground: null,
  dialog: null,

  farmer: null,
  plots: {},
  objectsHash: {},
  thinkers: [],

  // config params
  worldSize: 2000,
  searchRadius: 40,

  state: "not started"
};
var animations = {
};
game.objects = new $.gameQuery.QuadTree(game.worldSize, game.worldSize);
game.addObject = function(obj, x, y){
  if (x !== undefined && y !== undefined){
    game.objects.add(obj, x, y);
  }

  if (obj.attr("id") != ""){
    if (obj.isPlot){
      game.plots[obj.attr("id")] = obj;
    }
    game.objectsHash[obj.attr("id")] = obj;
  }
}
game.addThinker = function(thinker, x, y){
  if (x !== undefined && y !== undefined){
    game.objects.add(thinker.elem, x, y);
  }
  game.thinkers.push(thinker);
}
var view;

function toWindowCoords(hash){
  var pg = game.playground.offset();
  var bg = game.background.position();

  return {
    left: hash.left + bg.left + pg.left,
    top: hash.top + bg.top + pg.top
  };
}
function toWorldCoords(x, y){
  var pg = game.playground.offset();
  var bg = game.background.position();

  return new Vector(
    x - pg.left - bg.left,
    y - pg.top - bg.top
  );
}

function visibleObjects(){
  return game.objects.get(-game.background.position().left, -game.background.position().top,
    game.playground.width(), game.playground.height());
}

function gameLoop(){
  var timeElapsed = $.gameQuery.getTimeElapsed();

  if (game.state == "playing"){
    game.farmer.update(timeElapsed / JarmView.frameRate);

    var plot;
    for (var i in game.plots){
      if (i.match(/plot/)){
        plot = game.plots[i];

        if (plot.contains !== null && !plot.contains.fullGrown()){
          plot.contains.grow();
        }
      }
    }
  }

  $.each(game.thinkers, function(i, obj){
    obj.think();
  });

  Events.randomEvent();

  view.frame(timeElapsed);
  return false;
}

function activateRock(rock){
  // TODO: Make it so a rock can run out of seeds
  var plant = plants.getRandomSeed();

  if (plant === null){
    view.addMessage("Nothing found.");
  }else{
    view.addMessage("Found " + plant.name + ".");
    game.farmer.addItemSeeds(plant);
	view.drawSeeds();
  }
}

function activatePlot(plot){
  game.dialog = new PlantingDialog(plot);
}

function activateShop(shop){
  game.dialog = new ShopDialog(shop);
}

// This one is called when the user presses space
/*function activate(){
  var nearby = visibleObjects();

  var obj;
  $("#msg").html("");
  for (var i = 0; i < nearby.length; i++){
    obj = nearby[i];

    // TODO: Use a better near() system
    if (near(obj, game.farmer.elem, game.searchRadius * 2)){
      if (obj.attr("id") == "shop"){
        activateShop(game.shop);
      }
    }
    if (near(obj, game.farmer.elem, game.searchRadius)){
      //if (obj.attr("id").match(/rock/)){
      if (obj.isRock){
        activateRock(obj);
        break;
      //}else if (obj.attr("id").match(/plot/)){
      }else if (obj.isPlot){
        //activatePlot(game.plots[obj.attr("id")]);
        activatePlot(obj);
        break;
      }
    }
  }
}*/

game.plant = function(plot, plant){
  plot.contains = plant;
  plant.plot = plot;
  var elem = plant.createSprite(
    plot.position().left + 5,
    plot.position().top - 2
  );
  game.addObject(elem);
}

function onKeyPress(ev){
  if (game.state == "playing"){
    /*if (ev.which == keycodes.space){
      activate();
    }*/
  }else if (game.state == "paused"){
    if (ev.keyCode == keycodes.escape && game.dialog !== null){
      game.dialog.close();
    }
  }
}

function onClick(ev){
  if (game.state == "playing"){
    if (ev.originalTarget.tagName.toLowerCase() != "a"){
      // When you click a dialog item in Firefox it 
      // sends this click event, so we need to make
      // sure we didn't just hit a link

      var pg = game.playground.position();
      var pos, obj;

      if (ev.originalTarget.id.match(/^plant\d+/)){
        obj = game.objectsHash[ev.originalTarget.id].plant.plot;
      }else if (ev.originalTarget.id.match(/^(plot|rock|shop)/)){
        obj = game.objectsHash[ev.originalTarget.id];
      }else if (ev.clientX > pg.left && ev.clientX < pg.left + game.playground.width() &&
          ev.clientY > pg.top && ev.clientY < pg.top + game.playground.height()){
        pos = toWorldCoords(ev.clientX, ev.clientY);
      }

      if (obj !== undefined || pos !== undefined){
        if (obj !== undefined){
          pos = $(ev.originalTarget).position();
          // no need to convert to world coords since these points will already be in world coords
          pos = new Vector(pos.left, pos.top);
        }
        game.farmer.moveTo(pos, obj);
      }
    }
  }
}
