const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const speedSelect = document.getElementById('speed');
const pauseButton = document.getElementById('pauseButton');

const box = 10;
let score = 0;
let snake = [];
let food = {};
let specialFood = {};
let d;
let game;
let gameSpeed = 150;
let foodEatenCount = 0;
let specialFoodTimer = null;
let paused = false;

// Начальные координаты змейки
snake[0] = {
    x: 10 * box,
    y: 10 * box
};

// Генерация обычной еды
function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}

// Генерация специальной еды (растянутой)
function createSpecialFood() {
    specialFood = {
        x: Math.floor(Math.random() * (canvas.width / box - 2)) * box,
        y: Math.floor(Math.random() * (canvas.height / box - 2)) * box,
        width: box * 3,
        height: box * 3
    };
    specialFoodTimer = setTimeout(() => {
        specialFood = {};
        specialFoodTimer = null;
    }, gameSpeed * 10); // Таймер зависит от скорости игры
}

// Управление кнопками и паузой
document.addEventListener("keydown", (event) => {
    if (paused) return;

    if (event.keyCode == 37 && d != "RIGHT") { // Стрелка влево
        d = "LEFT";
    } else if (event.keyCode == 38 && d != "DOWN") { // Стрелка вверх
        d = "UP";
    } else if (event.keyCode == 39 && d != "LEFT") { // Стрелка вправо
        d = "RIGHT";
    } else if (event.keyCode == 40 && d != "UP") { // Стрелка вниз
        d = "DOWN";
    }
});

// Кнопка паузы на сайте
pauseButton.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
        pauseButton.innerText = "Продолжить";
    } else {
        pauseButton.innerText = "Пауза";
    }
});

// Проверка столкновений
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

// Главная функция отрисовки
function draw() {
    if (paused) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Пауза", canvas.width / 2 - 45, canvas.height / 2);
        return;
    }
    
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "green" : "white";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "red";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Рисуем обычную еду
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Рисуем специальную еду, если она существует
    if (specialFoodTimer) {
        ctx.fillStyle = "gold";
        ctx.fillRect(specialFood.x, specialFood.y, specialFood.width, specialFood.height);
    }

    // Старые координаты головы
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    // Прохождение сквозь стены
    if (snakeX < 0) {
        snakeX = canvas.width - box;
    } else if (snakeX >= canvas.width) {
        snakeX = 0;
    }
    if (snakeY < 0) {
        snakeY = canvas.height - box;
    } else if (snakeY >= canvas.height) {
        snakeY = 0;
    }
    
    let newHead = {
        x: snakeX,
        y: snakeY
    };

    // Проверяем, съела ли змейка специальную еду
    if (specialFoodTimer && 
        snakeX >= specialFood.x && snakeX < specialFood.x + specialFood.width &&
        snakeY >= specialFood.y && snakeY < specialFood.y + specialFood.height) {
        
        const multiplier = Math.floor(Math.random() * 4) + 3; // От 3 до 6
        score += multiplier * 10; // Удваивает очки за обычную еду
        foodEatenCount = 0;
        clearTimeout(specialFoodTimer);
        specialFood = {};
        specialFoodTimer = null;
        createFood();
        
    } else if (snakeX == food.x && snakeY == food.y) {
        score++;
        foodEatenCount++;
        if (foodEatenCount >= 10 && !specialFoodTimer) {
            createSpecialFood();
        } else {
            createFood();
        }
    } else {
        snake.pop(); // Удаляем хвост
    }

    scoreDisplay.innerText = score;

    // Конец игры при столкновении с хвостом
    if (collision(newHead, snake)) {
        clearInterval(game);
        alert("Конец игры! Очки: " + score);
    }

    snake.unshift(newHead); // Добавляем новую голову
}

// Запуск игры
function startGame() {
    clearInterval(game);
    if (specialFoodTimer) clearTimeout(specialFoodTimer);
    snake = [{ x: 10 * box, y: 10 * box }];
    score = 0;
    d = null;
    foodEatenCount = 0;
    specialFood = {};
    specialFoodTimer = null;
    paused = false;
    pauseButton.innerText = "Пауза";
    scoreDisplay.innerText = score;
    createFood();
    gameSpeed = 200 - (speedSelect.value * 20); // Расчет скорости
    game = setInterval(draw, gameSpeed);
}

speedSelect.addEventListener('change', startGame);

startGame();