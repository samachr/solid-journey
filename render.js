var gameMap = {};

function initialize() {
  params = {}
  decodeURIComponent(location.search.substring(1)).split("&").map(function(param){return param.split("=")}).forEach(function(param){params[param[0]] = param[1]})
  gameMap.playerX = 1;
  gameMap.playerY = 1;
  gameMap.width = parseInt(params.size.split(",")[0]);
  gameMap.height = parseInt(params.size.split(",")[1]);
  gameMap.map = createMap(gameMap.width, gameMap.height);
  gameMap.currentTile = function(){return gameMap.map[gameMap.playerX + gameMap.currentAttemptOffsetX][gameMap.playerY + gameMap.currentAttemptOffsetY]}
  gameMap.currentKey = params.key.replace("s", "#") || "C";
  gameMap.currentAttemptOffsetX = 0;
  gameMap.currentAttemptOffsetY = 0;
  gameMap.visible = gameMap.map.map(row => row.map(column => false))
  setControls()
  drawMap();

}

function setControls() {
  getMajorScale(gameMap.currentKey).forEach((note, index) => {
    var control = document.getElementById('btn'+index)
    control.innerText = note;
    control.onclick = () => tryAnswer(note);
  })
}

document.addEventListener('keydown', function(event) {
    if (event.keyCode == 37) { // Left
        move(-1,0, "left");
    } else if(event.keyCode == 38) { // Up
        if (gameMap.currentAnswerAttempt) {
          tryAnswer("#");
        } else {
          move(0,-1, "up");
        }
    } else if(event.keyCode == 39) { // Right
        move(1,0, "right");
    } else if(event.keyCode == 40) { // Down
      if (gameMap.currentAnswerAttempt) {
        tryAnswer("b")
      } else {
        move(0,1, "down");
      }
    } else if(event.keyCode == 65) { // a
        tryAnswer("a")
    } else if(event.keyCode == 66) { // b
        tryAnswer("b")
    } else if(event.keyCode == 67) { // c
        tryAnswer("c")
    } else if(event.keyCode == 68) { // d
        tryAnswer("d")
    } else if(event.keyCode == 69) { // e
        tryAnswer("e")
    } else if(event.keyCode == 70) { // f
        tryAnswer("f")
    } else if(event.keyCode == 71) { // g
        tryAnswer("g")
    } else if(event.keyCode == 83) { // s
        tryAnswer("#")
    } else if(event.keyCode == 27) { // escape
        clearAnswer();
    }
});

function draw_piano(key_index) {
  whites = [0,2,4,5,7,9,11];
  blacks = [1,3,-1,6,8,10,-1,-1, -1];

  isWhite = true;
  highlightIndex = -1;

  for (var i = 0; i < whites.length; i++) {
    if (key_index == whites[i]) {
      isWhite = true;
      highlightIndex = i;
    } else if (key_index == blacks[i]) {
      isWhite = false;
      highlightIndex = i;
    }
  }

  var canvas = document.getElementById('Piano');
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect (0, 0, 150, 150);

    for (var i = 0; i < 7; i++) {
        ctx.fillStyle = (isWhite && i == highlightIndex) ? "#0000EE" : "rgb(255,255,255)";
        ctx.fillRect(1 + i * 20, 0, 19, 99, 3, 5);
    }

    for (var i = 0; i < 7; i++) {
        if (!(i == 2 || i == 6)) {
            ctx.fillStyle = (!isWhite && i == highlightIndex) ? "#0000EE" : "rgb(0,0,0)";
            ctx.fillRect(15 + i * 20, 0, 12, 62, 3, 3);
        }
    }

    ctx.strokeStyle = "#EE0000";
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(140, 0);
    ctx.moveTo(140,1);
    ctx.lineTo(1, 0);
    ctx.stroke();
  }
}

function distance(x, y, width, height) {
  var dx = x/width - y/width;
  var dy = x%height - y%height;
  return Math.floor(Math.sqrt(dx*dx + dy*dy));
}

function createMap(width, height) {
  var mapData = [];
  for (var i = 0; i < width; i++) {
    mapData.push([]);
    for (var j = 0; j < height; j++) {
      mapData[i].push(Math.floor(Math.random() * 4));
    }
  }

  var win = Math.floor((Math.random() * (width*height-1)));
  var start = Math.floor((Math.random() * (width*height-1)));

  while (distance(win, start, width, height) < Math.sqrt(width*height)/2) {
    start = Math.floor((Math.random() * (width*height-1)));
    win = Math.floor((Math.random() * (width*height-1)));
  }

  mapData[Math.floor(win / width)][win % height] = 5;
  mapData[Math.floor(start / width)][start % height] = 4;
  gameMap.playerX = Math.floor(start / width);
  gameMap.playerY = Math.floor(start % height);
  return mapData;
}

var typeColors= ["gray", "blue", "green", "magenta", "white", "brown"]

function drawMap(playerDirection) {
  var typeIcons = ["", "balance-scale", "keyboard-o", "music"];
  var mapDOM = document.getElementById("map");
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      var x = i + gameMap.playerX - 2;
      var y = j + gameMap.playerY - 2;

      if (x >= 0 && y >= 0 && x < gameMap.width && y < gameMap.height) {
        mapDOM.rows[j].cells[i].innerHTML = '<i class="fa fa-'+typeIcons[gameMap.map[x][y]]+'"></i>';
        mapDOM.rows[j].cells[i].style.backgroundColor = typeColors[gameMap.map[x][y]]
        gameMap.visible[x][y] = true;
      } else {
        mapDOM.rows[j].cells[i].style.backgroundColor = "black";
      }
    }
  }
  mapDOM.rows[2].cells[2].style.backgroundColor = "yellow";
  if (playerDirection) {
    mapDOM.rows[2].cells[2].innerHTML = '<i class="fa fa-angle-'+playerDirection+'"></i>';
  } else {
    mapDOM.rows[2].cells[2].innerHTML = '<i class="fa fa-user"></i>';
  }
  drawMinimap();
}

function drawMinimap() {
  var canvas = document.getElementById('MiniMap');
  var ctx = canvas.getContext('2d');
  var blockSize = canvas.height / gameMap.height

  for (var i = 0; i < gameMap.width; i++) {
    for (var j = 0; j < gameMap.height; j++) {
      if (gameMap.visible[i][j]) {
        ctx.fillStyle = typeColors[gameMap.map[i][j]];
      } else {
        ctx.fillStyle = "black";
      }
      ctx.fillRect(blockSize * i, blockSize * j, blockSize, blockSize);
    }
  }

  ctx.fillStyle = "yellow"
  ctx.fillRect(blockSize * gameMap.playerX, blockSize * gameMap.playerY, blockSize, blockSize);

}

function move(x, y, directionName) {
  if(gameMap.playerX + x >= 0 && gameMap.playerX + x < gameMap.width) gameMap.currentAttemptOffsetX = x;
  if(gameMap.playerY + y >= 0 && gameMap.playerY + y < gameMap.height) gameMap.currentAttemptOffsetY = y;

  drawMap(directionName);
  updateQuery(gameMap.currentTile())
  gameMap.currentAnswerAttempt = null;
}

var majorScalePattern = [0,2,4,5,7,9,11];
var noteLettersS = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
var noteLettersB = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
var sharpKeys    = [2,4,6,7,9,11];
var flatKeys     = [0,1,3,5,8,10];

function getMajorScale(key) {
    var scale = []
    var startNote = noteLettersS.indexOf(key);
    if (startNote == -1) {
      startNote = noteLettersB.indexOf(key);
    }
    var isSharp = sharpKeys.indexOf(startNote) >= 0;

    for (var i = 0; i < 7; i++) {
        scale[i] = (isSharp) ? noteLettersS[(startNote + majorScalePattern[i]) % 12] : noteLettersB[(startNote + majorScalePattern[i]) % 12];
    }

    if (key == "F#") {
        scale[6] = "E#";
    }
    return scale;
}

function tryAnswer(letter) {
  // if (!gameMap.currentAnswerAttempt) { gameMap.currentAnswerAttempt = letter.toUpperCase();}

  if (gameMap.currentAnswerAttempt && gameMap.currentAnswerAttempt.length == 1 && letter == "b" || letter == "#") {
    gameMap.currentAnswerAttempt += letter;
  } else {
    gameMap.currentAnswerAttempt = letter
  }

  if (gameMap.currentAnswerAttempt.toUpperCase() == gameMap.currentPitch.toUpperCase()) {
    gameMap.map[gameMap.playerX + gameMap.currentAttemptOffsetX][gameMap.playerY + gameMap.currentAttemptOffsetY] = 0;
    gameMap.currentAnswerAttempt = null;
    gameMap.playerX += gameMap.currentAttemptOffsetX
    gameMap.playerY += gameMap.currentAttemptOffsetY
    gameMap.currentAttemptOffsetX = 0;
    gameMap.currentAttemptOffsetY = 0;
    drawMap();
    updateQuery(gameMap.currentTile())
  } else {
    console.log(gameMap.currentAnswerAttempt, gameMap.currentPitch);
  }
}

function clearAnswer() {
  gameMap.currentAnswerAttempt = null;
  gameMap.currentAttemptOffsetX = 0;
  gameMap.currentAttemptOffsetY = 0;
  drawMap();
  updateQuery(gameMap.currentTile())
}

function updateQuery(type) {
  var idsForType = ["info", "scaleDegree", "Piano", "Staff"]
  idsForType.filter(function(id){return idsForType[type] != id}).forEach(function(id){
    document.getElementById(id).style.display = "none";
  });
  if (type != 4 && type != 5) {
    document.getElementById(idsForType[type]).style.display = "block";
  }

  var pitchNumber = Math.floor((Math.random() * 7) + 1);
  var pitchName = getMajorScale(gameMap.currentKey)[pitchNumber-1];
  gameMap.currentPitch = pitchName;
  switch (type) {
    case 0:
      gameMap.currentAnswerAttempt = null;
      gameMap.playerX += gameMap.currentAttemptOffsetX
      gameMap.playerY += gameMap.currentAttemptOffsetY
      gameMap.currentAttemptOffsetX = 0;
      gameMap.currentAttemptOffsetY = 0;
      drawMap();
      break;
    case 4:
      gameMap.currentAnswerAttempt = null;
      gameMap.playerX += gameMap.currentAttemptOffsetX
      gameMap.playerY += gameMap.currentAttemptOffsetY
      gameMap.currentAttemptOffsetX = 0;
      gameMap.currentAttemptOffsetY = 0;
      drawMap();
      break;
    case 1:
      document.getElementById(idsForType[type]).innerHTML = pitchNumber;
      break;
    case 2:
      var pianoLocation = noteLettersS.indexOf(pitchName);
      if (pianoLocation == -1) {
        pianoLocation = noteLettersB.indexOf(pitchName);
      }
      draw_piano(pianoLocation);
      break;
    case 3:
      var noteStaff = (Math.floor((Math.random() * 2)) ? "treble" : "bass")
      var octave = noteStaff == "bass" ? 1 : Math.floor((Math.random() * 2) + 1)
      document.getElementById(idsForType[type]).src = "./assets/"+noteStaff+"-"+octave+"-"+pitchName+".png";
      break;
    case 5:
      gameMap.currentAnswerAttempt = null;
      gameMap.playerX += gameMap.currentAttemptOffsetX
      gameMap.playerY += gameMap.currentAttemptOffsetY
      gameMap.currentAttemptOffsetX = 0;
      gameMap.currentAttemptOffsetY = 0;
      drawMap();
      window.location='finish.html'+window.location.search;
      break;
  }
}
