var Item = function (yPos, xPos, desc) {
    this.id = generateId();
    this.desc = desc;
    this.yPos = yPos;
    this.xPos = xPos;
    //this.action = function
};

Item.prototype.inspect = function () {
    writeToConsole(this.desc);
};

Item.prototype.interact = function () {
    this.function();
    layer2Generator.removeObject(this);
}

//TODO: maybe give item prototype.interact function that removes item from playfield?

//TODO: ask david if this Potion.prototype = Item.prototype is okay?

//How do i get all item variables and functions in item instead of potion
var Potion = function (yPos, xPos, hp) {
    Item.call(this, yPos, xPos, "a health potion healing " + hp + " hitpoints.");
    this.hp = hp;
    this.function = () => {
        writeToConsole("you pick up the potion");
        writeToConsole(layer3Generator.healPlayer(this.hp));
    };
};

Potion.prototype = Object.create(Item.prototype);
Potion.prototype.constructor = Potion;


var GoldSack = function (yPos, xPos, amount) {
    Item.call(this, yPos, xPos, "a sack of gold containing " + amount + " gold.");
    this.amount = amount;
    this.function = () => {
        writeToConsole("you pick up the goldsack");
        writeToConsole(layer3Generator.addPlayerGold(this.amount));
    }
}

GoldSack.prototype = Object.create(Item.prototype);
GoldSack.prototype.constructor = GoldSack;


var Key = function (yPos, xPos) {
    Item.call(this, yPos, xPos, "the key to the next floor.");
    this.function = () => {
        writeToConsole("you pick up the key");
        writeToConsole(layer3Generator.setPlayerKey(true));
    }
}

Key.prototype = Object.create(Item.prototype);
Key.prototype.constructor = Key;