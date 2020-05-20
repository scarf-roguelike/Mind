class Monster{
	constructor(tile, sprite, hp){
        this.move(tile);
        this.sprite = sprite;
        this.hp = hp;
        this.teleportCounter = 3;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    changeGraphic(sprite){
        this.sprite = sprite
    }

    update(){
        this.teleportCounter--;
        if(this.stunned || this.teleportCounter > 0){
            this.stunned = false;
            return;
        }

        this.doStuff();
    }

    doStuff(){
       let neighbors = this.tile.getAdjacentPassableNeighbors();

       neighbors = neighbors.filter(t => !t.monster || t.monster.isPlayer);

       if(neighbors.length){
           neighbors.sort((a,b) => a.dist(player.tile) - b.dist(player.tile));
           let newTile = neighbors[0];
           this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
       }
    }

	draw(){
        if(this.teleportCounter > 0){ //1,2,3
            drawSprite(SPRITE_INDEX['ENEMY_PORTAL_'+(4-this.teleportCounter)], this.getDisplayX(),  this.getDisplayY());
        }else{
            drawSprite(this.sprite, this.getDisplayX(),  this.getDisplayY());
            this.drawHp();
        }

        this.offsetX -= Math.sign(this.offsetX)*(1/8);
        this.offsetY -= Math.sign(this.offsetY)*(1/8);
	}

    drawHp(){
        for(let i=0; i<this.hp; i++){
            drawSprite(
                SPRITE_INDEX['HEALTH_ICON'],
                this.getDisplayX() + (i%3)*(5/16),
                this.getDisplayY() - Math.floor(i/3)*(5/16)
            );
        }
    }

    tryMove(dx, dy){
        let newTile = this.tile.getNeighbor(dx,dy);
        if(newTile.passable){
            if(!newTile.monster){
                this.move(newTile);
            }else{
                if(this.isPlayer != newTile.monster.isPlayer){
                    this.attackedThisTurn = true;
                    newTile.monster.stunned = true;
                    newTile.monster.hit(1);

                    shakeAmount = 5;

                    this.offsetX = (newTile.x - this.tile.x)/2;
                    this.offsetY = (newTile.y - this.tile.y)/2;
                }
            }
            return true;
        }
    }

    hit(damage){
        this.hp -= damage;
        if(this.hp <= 0){
            this.die();
        }

        if(this.isPlayer){
            playSound("hit1");
        }else{
            playSound("hit2");
        }

    }

    heal(damage){
        this.hp = Math.min(maxHp, this.hp+damage);
    }

    die(){
        this.dead = true;
        this.tile.monster = null;
        this.sprite = 1; //수정
    }

    move(tile){
        if(this.tile){
            this.tile.monster = null;
            this.offsetX = this.tile.x - tile.x;
            this.offsetY = this.tile.y - tile.y;
        }
        this.tile = tile;
        tile.monster = this;
        tile.stepOn(this);
    }

    getDisplayX(){
        return this.tile.x + this.offsetX;
    }

    getDisplayY(){
        return this.tile.y + this.offsetY;
    }
}

class Player extends Monster{
    constructor(tile){
        super(tile, load_graphic(SPRITE_INDEX['PLAYER_1_TILE'], isASCII, isPlayer2), 3); //나중에 플레이어 변경 가능하게 바꾸기.
        this.isPlayer = true;
        this.teleportCounter = 0;
    }

    tryMove(dx, dy){
        if(super.tryMove(dx,dy)){
            tick();
        }
    }
}

class Aenemy extends Monster{
    constructor(tile){
        super(tile, SPRITE_INDEX['ENEMY_A'], 2);
    }

    doStuff(){
        this.attackedThisTurn = false;
        super.doStuff();

        if(!this.attackedThisTurn){
            super.doStuff();
        }
    }
}

class Benemy extends Monster{
    constructor(tile){
        super(tile, SPRITE_INDEX['ENEMY_B'], 3);
    }

    update(){
        let startedStunned = this.stunned;
        super.update();
        if(!startedStunned){
            this.stunned = true;
        }
    }
}

class Cenemy extends Monster{
    constructor(tile){
        super(tile, SPRITE_INDEX['ENEMY_C'], 1);
    }

    doStuff(){
        let neighbors = this.tile.getAdjacentNeighbors().filter(t => !t.passable && inBounds(t.x,t.y));
        if(neighbors.length){
            neighbors[0].replace(Floor);
            this.heal(0.5);
        }else{
            super.doStuff();
        }
    }
}

class Denemy extends Monster{
    constructor(tile){
        super(tile, SPRITE_INDEX['ENEMY_D'], 2);
    }

    doStuff(){
        let neighbors = this.tile.getAdjacentPassableNeighbors();
        if(neighbors.length){
            this.tryMove(neighbors[0].x - this.tile.x, neighbors[0].y - this.tile.y);
        }
    }
}