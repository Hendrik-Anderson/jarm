$(function(){
  $("#playground").playground({width: 800, height: 600, keyTracker: true});
  game.playground = $.playground();
  game.background = $("#sceengraph");

  loadPlants();
  loadObjects();
  loadShop();
  game.farmer = new Farmer();
  game.playground
    .addSprite("farmer", {animation: game.farmer.getAnimation(),
      width: game.farmer.width, height: game.farmer.height, posx: 400, posy: 300});
  game.farmer.elem = $("#farmer");
  game.farmer.setPos(400, 300);

  view = new JarmView();
  registerCallbacks();

  game.state = "not-started";

  keyTracker = $.gameQuery.keyTracker;
  $().setLoadBar("loading-bar", 400);
});

function loadPlants(){
  var tree = new Animation({imageURL: "images/tree.png"});
  for (var i = 0; i < 50; i++){
    var x = Math.floor(Math.random() * (game.worldSize - 38));
    var y = Math.floor(Math.random() * (game.worldSize - 38));
    game.playground.addSprite("tree" + i, {animation: tree, width: 45, height: 38,
      posx: x, posy: y});
    $("#tree" + i).addClass("collideable");
    game.addObject($("#tree" + i), x, y);
  }

  var rockAnim = new Animation({imageURL: "images/rock.png"});
  for (var i = 0; i < 30; i++){
    var x = Math.floor(Math.random() * (game.worldSize - 28));
    var y = Math.floor(Math.random() * (game.worldSize - 28));
    game.playground.addSprite("rock" + i, {animation: rockAnim, width: 40, height: 28,
      posx: x, posy: y});
    var rock = $("#rock" + i);
    rock.addClass("collideable");
    rock.isRock = true;
    game.addObject(rock, x, y);
  }
}

function loadObjects(){
  animations.plot = new Animation({imageURL: "images/plot.png"});

  for (var i = 1; i < 6; i++){
    game.playground
      .addSprite("plot" + i, {animation: animations.plot,
        width: 30, height: 30, posx: 260 + (i * 40), posy: 350});
    var plot = $("#plot" + i);
    plot.contains = null;
    plot.isPlot = true;
    plot.removePlant = function(){
      this.contains.removeSprite();
      this.contains = null;
    };
    game.addObject(plot, 260 + i * 40, 350);
  }

  animations.cop = {
    anim: new Animation({imageURL: "images/cop.png"}),
    width: 17,
    height: 31
  };
}

function loadShop(){
  game.shop = new Shop();
  game.shop.animation = new Animation({imageURL: "images/shop.png"});

  game.playground
    .addSprite("shop", {animation: game.shop.animation,
      width: 73, height: 48, posx: 30, posy: 30});
  game.shop.elem = $("#shop");
  game.shop.elem.isShop = true;
  game.shop.elem.shop = game.shop;
  game.addObject(game.shop.elem, 30, 30);
}

function registerCallbacks(){
  game.playground
    .registerCallback(gameLoop, JarmView.frameRate)
    .registerCallback(function() {view.update();}, view.updateRate);

  $("#start-button").click(function(){
    game.state = "playing";
    game.playground
      .startGame(function(){
        $("#welcome-screen").remove();
      });
  });

  $(document).keypress(onKeyPress);
  $(document).click(onClick);
}

