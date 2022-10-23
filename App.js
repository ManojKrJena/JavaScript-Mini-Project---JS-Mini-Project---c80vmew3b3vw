const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
var player1 = document.querySelector("#p1");
var player2 = document.querySelector("#p2");
var user1 = document.querySelector("#player1");
var user2 = document.querySelector("#player2");
var winner = document.querySelector("#winner");

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//change your Ingame setting

const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;
var paddleSpeed = 10;
var ballSpeed = 5;

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

var p1count = 0,
  p2count = 0,
  currentPoint = 0,
  gamePoint = 1,
  reqId = undefined;

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,
  // paddle velocity
  dy: 0,
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,
  // paddle velocity
  dy: 0,
};

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,
  // keep track of when need to reset the ball position
  resetting: false,
  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed,
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// game loop

function loop() {
  reqId = requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);
  // move paddles by their velocity
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;
  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  } else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }
  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  } else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }
  // draw paddles
  context.fillStyle = "white";
  context.fillRect(
    leftPaddle.x,
    leftPaddle.y,
    leftPaddle.width,
    leftPaddle.height
  );
  context.fillRect(
    rightPaddle.x,
    rightPaddle.y,
    rightPaddle.width,
    rightPaddle.height
  );
  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;
  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  } else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }
  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ((ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;
    if (ball.x > canvas.width) {
      p1count += 1;
      player1.innerText = p1count;
      currentPoint = Math.max(p1count, currentPoint);
    } else {
      p2count += 1;
      player2.innerText = p2count;
      currentPoint = Math.max(p2count, currentPoint);
    }
    if (currentPoint == gamePoint) {
      document.querySelector(".result").style.display = "flex";
      winner.innerText =
        p1count > p2count ? ` ${user1.value} Won!!` : `${user2.value} Won!!`;
      cancelAnimationFrame(reqId);
      return;
    }
    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 2000);
  }
  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;
    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  } else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;
    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }
  // draw ball
  context.fillStyle = "white";
  context.beginPath();
  context.arc(ball.x, ball.y, 10, 0, 2 * Math.PI);
  context.fill();
  // draw walls
  context.fillStyle = "lightgrey";
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// listen to keyboard events to move the paddles

document.addEventListener("keydown", function (e) {
  // up arrow key
  if (e.which === 38) {
    rightPaddle.dy = -paddleSpeed;
  }
  // down arrow key
  else if (e.which === 40) {
    rightPaddle.dy = paddleSpeed;
  }
  // w key
  if (e.which === 87) {
    leftPaddle.dy = -paddleSpeed;
  }
  // a key
  else if (e.which === 83) {
    leftPaddle.dy = paddleSpeed;
  }
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// listen to keyboard events to stop the paddle if key is released
document.addEventListener("keyup", function (e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }
  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// start the game
let btn = document.querySelector(".start-btn");
let reset = document.querySelector(".restart-btn");
let header = document.querySelector(".header");
let result = document.querySelector(".result");
let u1 = document.querySelector("#u1");
let u2 = document.querySelector("#u2");
btn.addEventListener("click", () => {
  header.style.display = "none";
  u1.innerText = user1.value;
  u2.innerText = user2.value;
  player1.innerText = p1count;
  player2.innerText = p2count;
  reqId = requestAnimationFrame(loop);
});
reset.addEventListener("click", () => {
  currentPoint = 0;
  p1count = 0;
  player1.innerText = p1count;
  p2count = 0;
  player2.innerText = p2count;
  result.style.display = "none";
  ball.resetting = false;
  ball.dx = 5;
  ball.dy = -5;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  reqId = requestAnimationFrame(loop);
});
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
