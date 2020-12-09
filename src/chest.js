//deprecated, do not use

var Chest = function (yPos, xPos, item) {
    this.yPos = yPos;
    this.xPos = xPos;
    this.item = item;
};

Chest.prototype.inspect = function () {
    writeToConsole("An ordinary chest, nothing special about it really, apart from perhaps it's contents.");
};

Chest.prototype.interact = function () {
    if (this.item === null) {
        writeToConsole("the chest appears to be empty");
        return;
    }
    let itemDesc = "???";
    let itemInteraction = "???";
    switch (this.item.name) {
        case "health potion": {
            itemDesc = "a health potion healing " + this.item.hp;
            itemInteraction = layer3Generator.healPlayer(this.item.hp);
            break;
        }  
        case "gold": {
            itemDesc = this.item.amount + " gold";
            itemInteraction = layer3Generator.addPlayerGold(this.item.amount);
            break;
        }
        case "key": {
            itemDesc = "the key to the next floor";
            layer3Generator.setPlayerKey(true);
            break;
        }
    }

    writeToConsole("You open the chest, it contained: " + itemDesc);
    if (itemInteraction !== "???") {
        writeToConsole(itemInteraction);
    }
    this.item = null;
};