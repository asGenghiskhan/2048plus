const boardElement = document.getElementById('board');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart');
const changeOperatorButton = document.getElementById('change-operator');
const gameoverModal = document.getElementById('gameover-modal');
const finalScoreElement = document.getElementById('final-score');
const operatorDisplay = document.getElementById('operator-display');
const multiplicationCountDisplay = document.getElementById('multiplication-count');

let board = [];
let score = 0;
let multiplicationCount = 3; // 初始乘法使用次数
let isOperatorChanged = false; // 运算符是否已更改
let isDarkMode = false; // 深色模式状态
let startTime;
let timerInterval;


function init() {
    board = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    multiplicationCount = 3; // 重置乘法计数
    isOperatorChanged = false; // 重置运算符更改状态
    updateBoard();
    addRandomTile();
    addRandomTile();
    startTime = Date.now(); // 记录开始时间
    timerInterval = setInterval(updateTimer, 1000); // 每秒更新
}

function addRandomTile() {
    let emptyTiles = [];
    board.forEach((row, r) => {
        row.forEach((tile, c) => {
            if (tile === 0) emptyTiles.push({ r, c });
        });
    });
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // 计算经过的秒数
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `游戏时间: ${minutes}分 ${seconds}秒`;
}

function updateBoard() {
    boardElement.innerHTML = '';
    board.forEach(row => {
        row.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            tileElement.textContent = tile === 0 ? '' : tile;
            tileElement.style.backgroundColor = getTileColor(tile);
            if (isDarkMode) {
                tileElement.classList.add('dark-mode');
            }
            boardElement.appendChild(tileElement);
        });
    });
    scoreElement.textContent = score; // 更新得分显示
    multiplicationCountDisplay.textContent = `剩余乘法次数: ${multiplicationCount}`; // 更新乘法次数显示

    if (isGameOver()) {
        finalScoreElement.textContent = score; // 显示得分
        gameoverModal.style.display = 'flex'; // 显示模态框
    }
}

function getTileColor(value) {
    switch (value) {
        case 2: return '#eee4da';
        case 4: return '#ede0c8';
        case 8: return '#f2b179';
        case 16: return '#f59563';
        case 32: return '#f67c5f';
        case 64: return '#f67c5f';
        case 128: return '#f9f59d';
        case 256: return '#f9f59d';
        case 512: return '#c2e4f1';
        case 1024: return '#c2e4f1';
        case 2048: return '#33b5e5';
        default: return '#ccc0b3';
    }
}

function move(direction) {
    if (multiplicationCount === 0 && isOperatorChanged) {
        alert("乘法运算符次数已用完，无法移动！");
        return; // 如果乘法次数为零，停止移动
    }

    let moved = false;
    let newBoard = JSON.parse(JSON.stringify(board));

    for (let i = 0; i < (board.length); i++) {
        let row = [];
        for (let j = 0; j < (board.length); j++) {
            let x = direction === 'left' ? i : direction === 'right' ? i : direction === 'up' ? j : (board.length - 1 - j);
            let y = direction === 'left' ? j : direction === 'right' ? (board.length - 1 - j) : direction === 'up' ? i : i;
            if (newBoard[x][y] !== 0) row.push(newBoard[x][y]);
        }

        let mergedRow = [];
        for (let j = 0; j < row.length; j++) {
            if (j < row.length - 1 && row[j] === row[j + 1]) {
                if (multiplicationCount > 0 && isOperatorChanged) {
                    mergedRow.push(row[j] * row[j + 1]); // 使用乘法
                    multiplicationCount--; // 减少乘法次数
                    score += row[j] * row[j + 1]; // 更新得分
                } else {
                    mergedRow.push(row[j] + row[j + 1]); // 使用加法
                    score += row[j] + row[j + 1]; // 更新得分
                }
                j++; // 跳过下一个方块
                moved = true;
            } else {
                mergedRow.push(row[j]);
            }
        }

        while (mergedRow.length < (board.length)) mergedRow.push(0);

        for (let j = 0; j < (board.length); j++) {
            let x = direction === 'left' ? i : direction === 'right' ? i : direction === 'up' ? j : (board.length - 1 - j);
            let y = direction === 'left' ? j : direction === 'right' ? (board.length - 1 - j) : direction === 'up' ? i : i;
            newBoard[x][y] = mergedRow[j];
        }
    }

    if (JSON.stringify(board) !== JSON.stringify(newBoard)) {
        board = newBoard;
        addRandomTile();
    }

    // 检查是否合成2048并扩展棋盘
    if (board.flat().includes(2048) && board.length === 4) {
        expandBoard();
    }

    updateBoard();
}

function expandBoard() {
    const newBoard = Array.from({ length: 5 }, () => Array(5).fill(0));

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            newBoard[i][j] = board[i][j];
        }
    }

    board = newBoard;
    addRandomTile();
}

function isGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) return false;
            if (r < 3 && board[r][c] === board[r + 1][c]) return false;
            if (c < 3 && board[r][c] === board[r][c + 1]) return false;
        }
    }
    clearInterval(timerInterval); // 停止计时器
    return true;
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowDown':
            move('down');
            break;
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowRight':
            move('right');
            break;
    }
});

// Touch handling for mobile
let startX, startY;

boardElement.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
});

boardElement.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        if (diffY > 0) {
            move('down');
        } else {
            move('up');
        }
    }
});

restartButton.addEventListener('click', () => {
    gameoverModal.style.display = 'none'; // 隐藏模态框
    init(); // 重新初始化游戏
});


changeOperatorButton.addEventListener('click', () => {
    isOperatorChanged = !isOperatorChanged; // 切换运算符状态
    operatorDisplay.textContent = isOperatorChanged ? '当前运算符: 乘法' : '当前运算符: 加法';
    alert('运算符已更改。');
});

// 深色模式切换
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    updateBoard(); // 更新棋盘以应用深色模式
});

init();
