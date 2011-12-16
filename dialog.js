function Dialog(selector){
  if (selector === undefined){
    selector = "#dialog";
  }
  game.state = "paused";

  this.dlg = $(selector)
    .children(".dlg-content")
      .end()
    .show();
}
Dialog.prototype.close = function(){
  game.state = "playing";
  this.dlg.hide();
};
Dialog.prototype.setContent = function(html){
  this.dlg.children(".dlg-content").html(html);
};

function PlantingDialog(plot){
  Dialog.call(this);

  var text;
  if (plot.contains !== null){
    var plantName;
    if (plot.contains.type.match(/^[aeiou]/i)){
      plantName = "n " + plot.contains.type;
    }else{
      plantName = " " + plot.contains.type;
    }
    text = "This plot contains a " + plantName + " plant.<p/>";

    if (plot.contains.fullGrown()){
      text += '<a href = "#" onclick = "game.dialog.pick(\'' + plot.attr("id") + '\'); return false">Pick It</a>';
    }else{
      text += "When it is full grown you will be able to pick it.";
    }
  }else{
    // find something to plant
    text = "This plot is empty. What would you like to plant?<br />";

    var found = false;
    game.farmer.eachItemSeeds(function(i, item){
      if (item.isSeed()){
        found = true;
        text += '<a href = "#" onclick = "game.dialog.plant(' + i + '); return false">' +
          item.name + '</a><br />';
      }
    });
    
    if (!found){
      text = "You have nothing to plant.<p/> Find some seeds by searching the rocks";
    }else{
      text += '<a href = "#" onclick = "game.dialog.close(); return false">Nothing</a>';
    }
  }

  this.plot = plot;
  this.setContent(text);
}
PlantingDialog.prototype = Dialog.prototype;

PlantingDialog.prototype.plant = function(which){
  var plant = game.farmer.getItemSeeds(which);

  if (!plant.isSeed()){
    console.log("Error: tried to plant non-seed");
    return;
  }
  game.farmer.removeItemSeeds(which);

  game.plant(this.plot, plant);
  view.drawSeeds();
  this.close();
}

PlantingDialog.prototype.pick = function(which){
  var plot = game.plots[which];

  game.farmer.addItemInventory(plot.contains);
  plot.removePlant();
  view.drawInventory();
  view.drawSeeds();
  this.close();
}

function ShopDialog(shop){
  Dialog.call(this, "#shop-dlg");

  var text = "";
  // Load up buy page
  text = "Nothing to buy yet!";

  $("#shop-buy").html(text);

  // Load up sell page
  var found = false;
  text = "";
  game.farmer.eachItemInventory(function(i, obj){
    if (!obj.isSeed()){
      found = true;
      text += '<a href = "#" onclick = "game.dialog.sell(' + i + '); return false">' +
        obj.name + '</a><br />';
    }
  });
  
  if (!found){
    text = "You have nothing to sell.<p/>Grow some plants!";
  }else{
    text = "What would you like to sell?<br />" +
      text +
      ' <a href = "#" onclick = "game.dialog.close(); return false">Nothing</a>';
  }

  this.shop = shop;
  $("#shop-sell").html(text);
}
ShopDialog.prototype = Dialog.prototype;

ShopDialog.prototype.sell = function(index){
  var obj = game.farmer.getItemInventory(index);

  // TODO: make it so you can sell seeds
  if (obj.isSeed()){
    console.log("Error: tried to sell seed");
  }
  game.farmer.removeItemInventory(index);

  this.shop.sell(obj);
  view.drawInventory();
  this.close();
}

ShopDialog.prototype.openPanel = function(which){
  if (which == "sell"){
    $("#shop-sell").show();
    $("#shop-buy").hide();
  }else{
    $("#shop-sell").hide();
    $("#shop-buy").show();
  }
}
