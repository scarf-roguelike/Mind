
function setupCanvas(){
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = tileSize*(numTiles+uiWidth);
    canvas.height = tileSize*numTiles;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    ctx.imageSmoothingEnabled = false;
}


function drawSprite(sprite, x, y){
    ctx.drawImage(
        spritesheet, //그릴 이미지
        sprite*32,  //원본 이미지 x 위치
        0,          //원본 이미지 y 위치
        32,         // 잘라낼 가로길이
        32,         // 잘라낼 세로길이
        x*tileSize, //출력할 x 위치
        y*tileSize, //출력할 y 위치
        tileSize, // 출력할 이미지 가로길이
        tileSize //출력할 이미지 세로길이
        );
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let i=0;i<numTiles;i++){
        for(let j=0;j<numTiles;j++){
            getTile(i,j).draw();
        }
    }

    for(let i=0;i<monsters.length;i++){
    monsters[i].draw();
    }

    player.draw();
}

function tick(){
    for(let k=monsters.length-1;k>=0;k--){
        if(!monsters[k].dead){
            monsters[k].update();
        }else{
            monsters.splice(k,1);
        }
    }
}
