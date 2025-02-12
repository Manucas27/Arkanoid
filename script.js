const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 320;

// Variables del juego
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").innerText = highScore;

const paddleHeight = 10, paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

const ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;

// Velocidad inicial de la bola
let dx = 2, dy = -2;

const brickRowCount = 3, brickColumnCount = 5;
const brickWidth = 75, brickHeight = 20, brickPadding = 10;
const brickOffsetTop = 30, brickOffsetLeft = 30;

let bricks = [];

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

let rightPressed = false, leftPressed = false;

// Eventos de teclado
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Movimiento con botones virtuales
document.getElementById("leftBtn").addEventListener("mousedown", () => leftPressed = true);
document.getElementById("leftBtn").addEventListener("mouseup", () => leftPressed = false);
document.getElementById("rightBtn").addEventListener("mousedown", () => rightPressed = true);
document.getElementById("rightBtn").addEventListener("mouseup", () => rightPressed = false);

// Touch para los botones
document.getElementById("leftBtn").addEventListener("touchstart", () => leftPressed = true);
document.getElementById("leftBtn").addEventListener("touchend", () => leftPressed = false);
document.getElementById("rightBtn").addEventListener("touchstart", () => rightPressed = true);
document.getElementById("rightBtn").addEventListener("touchend", () => rightPressed = false);

// Movimiento táctil (deslizar el dedo)
canvas.addEventListener("touchmove", function (e) {
    let touchX = e.touches[0].clientX - canvas.offsetLeft;
    paddleX = touchX - paddleWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
});

// Dibujar la pelota
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

// Dibujar la paleta
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

// Dibujar los ladrillos
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "blue";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Colisiones con los ladrillos
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (
                    x + ballRadius > b.x && x - ballRadius < b.x + brickWidth &&
                    y + ballRadius > b.y && y - ballRadius < b.y + brickHeight
                ) {
                    dy = -dy;
                    b.status = 0;
                    score += 10;
                    document.getElementById("score").innerText = score;

                    // Aumentar velocidad progresivamente
                    if (dx > 0) dx += 0.1;
                    else dx -= 0.1;
                    if (dy > 0) dy += 0.1;
                    else dy -= 0.1;
                }
            }
        }
    }
}

// Colisión con la paleta
function paddleCollision() {
    if (y + dy > canvas.height - paddleHeight - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; // Rebote normal
            let impact = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            dx = impact * 5; // Modifica la dirección según el impacto
        } else {
            restartGame(); // Perdiste
        }
    }
}

// Reiniciar juego
document.getElementById("restartBtn").addEventListener("click", restartGame);

function restartGame() {
    document.location.reload();
}

// Dibujar el juego
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    paddleCollision();

    // Rebote en las paredes laterales
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    
    // Rebote en el techo
    if (y + dy < ballRadius) dy = -dy;

    x += dx;
    y += dy;

    // Movimiento con botones o teclado
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 5;
    else if (leftPressed && paddleX > 0) paddleX -= 5;

    requestAnimationFrame(draw);
}

draw();
