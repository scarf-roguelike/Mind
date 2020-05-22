
function setupCanvas(){
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = tileSize*(numTiles+uiWidth);
    canvas.height = tileSize*numTiles;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    ctx.imageSmoothingEnabled = false;
}

function drawText(text, size, centered, textY, color){
    ctx.fillStyle = color;
    ctx.font = size + "px monospace";
    let textX;
    if(centered){
        textX = (canvas.width-ctx.measureText(text).width)/2;
    }else{
        textX = canvas.width-uiWidth*tileSize+25;
    }

    ctx.fillText(text, textX, textY);
}

function drawSprite(sprite, x, y){
    ctx.drawImage(
        spritesheet, //그릴 이미지
        sprite*32,  //원본 이미지 x 위치
        0,          //원본 이미지 y 위치
        32,         // 잘라낼 가로길이
        32,         // 잘라낼 세로길이
        x*tileSize + shakeX, //출력할 x 위치
        y*tileSize + shakeY , //출력할 y 위치
        tileSize, // 출력할 이미지 가로길이
        tileSize //출력할 이미지 세로길이
        );
}

function draw(){
    if(gameState == "running" || gameState == "dead"){
        ctx.clearRect(0,0,canvas.width,canvas.height);

        screenshake();

        for(let i=0;i<numTiles;i++){
            for(let j=0;j<numTiles;j++){
                getTile(i,j).draw();
            }
        }

        for(let i=0;i<monsters.length;i++){
        monsters[i].draw();
        }

        player.draw();

        drawText("Level: "+level, 30, false, 40, "violet");
        drawText("Score: "+score, 30, false, 70, "violet");
    }
}

function load_graphic(index, isPlayerASCII=false, isPlayer2=false){
    //index_enum = SPRITE_INDEX[index]
    index_enum = index

    if (isPlayer2){
    index_enum += 2;
    }

    if (isPlayerASCII){
        return index_enum + 1;
    } else {
        return index_enum;
    }
}

function screenshake(){
    if(shakeAmount){
        shakeAmount--;
    }
    let shakeAngle = Math.random()*Math.PI*2;
    shakeX = Math.round(Math.cos(shakeAngle)*shakeAmount);
    shakeY = Math.round(Math.sin(shakeAngle)*shakeAmount);
}

function tick(){
    for(let k=monsters.length-1;k>=0;k--){
        if(!monsters[k].dead){
            monsters[k].update();
        }else{
            monsters.splice(k,1);
        }
    }

    if(player.dead){
        addScore(score, false);
        gameState = "dead";
    }

    spawnCounter--;
    if(spawnCounter <= 0){
        spawnMonster();
        spawnCounter = spawnRate;
        spawnRate--;
    }
}

function showTitle(){
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    gameState = "title";

    drawText("MIND", 70, true, canvas.height/2 - 110, "white");
    drawText("READER", 70, true, canvas.height/2 - 50, "white");

    drawScores();
}

function drawScores(){
    let scores = getScores();
    if(scores.length){
        drawText(
            rightPad(["RUN","SCORE","TOTAL"]),
            18,
            true,
            canvas.height/2,
            "white"
        );

        let newestScore = scores.pop();
        scores.sort(function(a,b){
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);

        for(let i=0;i<Math.min(10,scores.length);i++){
            let scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
            drawText(
                scoreText,
                18,
                true,
                canvas.height/2 + 24+i*24,
                i == 0 ? "aqua" : "violet"
            );
        }
    }
}


function initSounds(){
    sounds = {
        hit1: new Audio('sounds/hit1.wav'),
        hit2: new Audio('sounds/hit2.wav'),
        treasure: new Audio('sounds/treasure.wav'),
        newLevel: new Audio('sounds/newLevel.wav'),
        spell: new Audio('sounds/spell.wav'),
    };
}

function playSound(soundName){
    sounds[soundName].currentTime = 0;
    sounds[soundName].play();
}

function getScores(){
    if(localStorage["scores"]){
        return JSON.parse(localStorage["scores"]);
    }else{
        return [];
    }
}

function addScore(score, won){
    let scores = getScores();
    let scoreObject = {score: score, run: 1, totalScore: score, active: won};
    let lastScore = scores.pop();

    if(lastScore){
        if(lastScore.active){
            scoreObject.run = lastScore.run+1;
            scoreObject.totalScore += lastScore.totalScore;
        }else{
            scores.push(lastScore);
        }
    }
    scores.push(scoreObject);

    localStorage["scores"] = JSON.stringify(scores);
}

function startGame(){
    level = 1;
    score = 0;
    startLevel(startingHp);

    gameState = "running";
}

function startLevel(playerHp){
    spawnRate = 15;
    spawnCounter = spawnRate;

    generateLevel();

    player = new Player(randomPassableTile());
    player.hp = playerHp;

    randomPassableTile().replace(Exit);
}

