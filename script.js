//Configuramos el Canvas
const canvas = document.getElementById("gameCanvas"); //Obtenemos el elemento Canvas
const ctx = canvas.getContext("2d"); //Su contexto 2d para dibujar en él

//Definimos el ancho y alto del área de juego.
canvas.width = 480;
canvas.height = 320;

// Variables del juego
let score = 0; //Puntaje del jugador
let highScore = localStorage.getItem("highScore") || 0;//Máxima puntuación guardada en localStorage.
document.getElementById("highScore").innerText = highScore; //Muestra la máxima puntuación

const paddleHeight = 10, paddleWidth = 75; //Tamaño de la paleta
let paddleX = (canvas.width - paddleWidth) / 2; //Pisición horizontal de la paleta

const ballRadius = 8; //Radio de la pelota
//Posición de la pelota
let x = canvas.width / 2;
let y = canvas.height - 30;

// Velocidad inicial de la pelota
let dx = 2, dy = -2;

const brickRowCount = 3, brickColumnCount = 5; //Número de filas y columnas de bloques
const brickWidth = 75, brickHeight = 20, brickPadding = 10; //Tamaño de cada bloque (Tamaño de cada bloque con brickPadding)
const brickOffsetTop = 30, brickOffsetLeft = 30; //Margen desde el borde superior e izquierdo

let bricks = []; //Matriz que almacena los bloques

for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

let rightPressed = false, leftPressed = false;

// Detectar cuándo se presionan o sueltan las teclas de flecha (izquierda/derecha) para mover la paleta
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

// Dibujar la pelota (carita feliz)
function drawBall() {
    // Cuerpo de la pelota (círculo amarillo)
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();

    // Ojos
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 2, 0, Math.PI * 2); // Ojo izquierdo
    ctx.arc(x + 4, y - 3, 2, 0, Math.PI * 2); // Ojo derecho
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    // Boca (sonrisa)
    ctx.beginPath();
    ctx.arc(x, y + 2, 4, 0, Math.PI, false); // Media circunferencia hacia abajo
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
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

// Dibujar los ladrillos con textura
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                // Estilo de ladrillo con textura
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);

                // Color base del ladrillo con degradado
                let gradient = ctx.createLinearGradient(brickX, brickY, brickX + brickWidth, brickY + brickHeight);
                gradient.addColorStop(0, "#b22222"); // Rojo ladrillo
                gradient.addColorStop(1, "#8b0000"); // Rojo más oscuro
                ctx.fillStyle = gradient;
                ctx.fill();

                // Bordes para simular las juntas entre ladrillos
                ctx.strokeStyle = "#8b0000"; // Rojo más oscuro para los bordes
                ctx.lineWidth = 2;
                ctx.stroke();

                // Detalles para simular textura de ladrillo (líneas horizontales y verticales)
                ctx.beginPath();
                for (let i = 1; i < 3; i++) {
                    ctx.moveTo(brickX + i * 20, brickY);
                    ctx.lineTo(brickX + i * 20, brickY + brickHeight);
                }
                for (let i = 1; i < 2; i++) {
                    ctx.moveTo(brickX, brickY + i * 10);
                    ctx.lineTo(brickX + brickWidth, brickY + i * 10);
                }
                ctx.strokeStyle = "#8b0000"; // Líneas más oscuras para textura
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.closePath();
            }
        }
    }
}

// Colisiones con los ladrillos
function collisionDetection() { //Detecta colisiones entre la pelota y los bloques
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

                    // Verificar si todos los bloques han sido eliminados
                    if (score === brickRowCount * brickColumnCount * 10) {
                        showMessage("Ganaste!");
                        setTimeout(restartGame, 500);
                    }
                }
            }
        }
    }
}

// Colisión con la paleta
function paddleCollision() { //Detecta colisiones entre la pelota y la paleta
    if (y + dy > canvas.height - paddleHeight - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; // Rebote normal
            let impact = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            dx = impact * 5; // Modifica la dirección según el impacto
        } else {
            showMessage("Perdiste!"); //Muestra mensajes de "Ganaste" o "Perdiste"
            setTimeout(restartGame, 500); //Se reinicia el juego
        }
    }
}

// Mostrar mensaje en pantalla
function showMessage(message) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Reiniciar juego
document.getElementById("restartBtn").addEventListener("click", restartGame);

function restartGame() {
    // Actualizar la máxima puntuación
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScore").innerText = highScore;
    }

    // Reiniciar variables del juego
    score = 0;
    document.getElementById("score").innerText = score;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;

    // Reiniciar bloques
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    // Limpiar el mensaje
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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

draw(); //Actualiza la pantalla y la lógica del juego.