var userPaddle, computerPaddle, computerScore, playerScore, gameState, ball,scoreSound, wall_hitSound, hitSound;
var canvasWidth = 400
var canvasHeight = 400
var computerPaddleData, userPaddleData
var database, players, palyer1Data, player2Data,gameStateData, gameSateId, playersId

function preload(){
  scoreSound = loadSound('score.mp3');
  wall_hitSound = loadSound('wall_hit.mp3');
  hitSound = loadSound('hit.mp3');
}

function setup() {

createCanvas(canvasWidth,canvasHeight);
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  database = firebase.database();
  players = database.ref('playersPaddle');
  gameState = database.ref("gameState")


  computerPaddleData = {
    name: 'player1',
    position : 1,
    available : true,
    score: 0
  }

  userPaddleData = {
    name: 'player2',
    position : 2,
    available : true,
    score : 0
  }
  players.push(computerPaddleData);
  players.push(userPaddleData);

  players.on("value", gotPlayersData, gotPlayersErrorData)

  gameStateData = {
    state : "serve"
  }
  gameState.push(gameStateData);
  gameState.on("value", gotGameSateData, gotGameSateErrorData)

  //create a user paddle sprite
  userPaddle = createSprite(390,200,10,70);

  //create a computer paddle sprite
  computerPaddle = createSprite(10,200,10,70);

  //create the pong ball
  ball = createSprite(200,200,12,12);
}

function draw() {
  // fill the computer screen with white color
  background("white");
  edges = createEdgeSprites();
  //display Scores
  text(computerScore,170,20);
  text(playerScore, 230,20);

  //draw dotted lines
  for (var i = 0; i < 400; i+=20) {
     line(200,i,200,i+10);
  }

  if (gameState.state === "serve") {

    text("Press Space to Serve",150,180);
  }

  if (gameState.state === "over") {
    text("Game Over!",170,160);
    text("Press 'R' to Restart",150,180);
  }

  if (keyDown("r")) {
    writeGameSateData(gameSateId, "serve")
    writePlayerData(playersId[0],0)
    writePlayerData(playersId[1],0)
  }


  //give velocity to the ball when the user presses play
  //assign random velocities later for fun
  if (keyDown("space") && gameState.state == "serve") {
    ball.velocityX = 5;
    ball.velocityY = 5;
    writeGameSateData(gameSateId, "play")
  }

  //make the userPaddle move with the mouse
  userPaddle.y = World.mouseY;



  //make the ball bounce off the user paddle
  if(ball.isTouching(userPaddle)){
    hitSound.play();
    ball.x = ball.x - 5;
    ball.velocityX = -ball.velocityX;
  }

  //make the ball bounce off the computer paddle
  if(ball.isTouching(computerPaddle)){
    hitSound.play();
    ball.x = ball.x + 5;
    ball.velocityX = -ball.velocityX;
  }

  //place the ball back in the centre if it crosses the screen
  if(ball.x > 400 || ball.x < 0){
    scoreSound.play();

  if (ball.x < 0) {
      playerScore++;
      writePlayerData(playersId[1],playerScore)
    }
    else {
      computerScore++;
      writePlayerData(playersId[0],computerScore);
    }

    ball.x = 200;
    ball.y = 200;
    ball.velocityX = 0;
    ball.velocityY = 0;
    writeGameSateData(gameSateId, "serve")

    if (computerScore=== 5 || playerScore === 5){
      writeGameSateData(gameSateId, "over")
    }
  }

  //make the ball bounce off the top and bottom walls
  if (ball.isTouching(edges[2]) || ball.isTouching(edges[3])) {
    ball.bounceOff(edges[2]);
    ball.bounceOff(edges[3]);
    wall_hitSound.play();
  }

  //add AI to the computer paddle so that it always hits the ball
  computerPaddle.y = ball.y;

    drawSprites();
}


function gotGameSateData(data){
  var stateObject = data.val();
  var id = Object.keys(stateObject)
  gameSateId  = id[id.length-1]
  gameState = stateObject[id[id.length-1]]
}

function gotGameSateErrorData(error){
  console.log("Error!");
  console.log(error);
}

function writeGameSateData(stateId, value) {
  firebase.database().ref('gameState/' + stateId).set({
    state: value
  });
}


function gotPlayersData(data){
  var playerObject = data.val();
  var id = Object.keys(playerObject);
  playersId = id.slice(id.length - 2, id.length);
  computerScore  = playerObject[playersId[0]]["score"];
  console.log(computerScore);
  playerScore = playerObject[playersId[1]]["score"];
}

function gotPlayersErrorData(error){
  console.log("Error!");
  console.log(error);
}

function writePlayerData(playerId, score) {
  firebase.database().ref('playersPaddle/' + playerId).set({
    score : score
  });
}
