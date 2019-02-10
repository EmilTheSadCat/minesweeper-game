const canvas = document.getElementById('canvas');
const timerIndicator = document.querySelector('.timer');
const minesLeftIndicator = document.querySelector('.mines-left');

const ctx = canvas.getContext('2d');
let numberOfRows = 16;
let numberOfColumns = 25;

let numberOfCells = numberOfRows * numberOfColumns;

const gridSize = 23;
const mines = 65;


setCanvasDimensions();

const canvasPosition = {
    x: window.canvas.offsetLeft,
    y: window.canvas.offsetTop
}

class Cell { 
    
    constructor(coords) {
        this.coords = coords;
    }
}


let minefield = [];
let minesArr = [];
let safeStartingArea = [];

let testNumber = 39;
let counter = 0;
let timer = 0;
createMinefield();
drawMinefield();



canvas.addEventListener('click', (e) => pickCellWithMouse(e));
window.oncontextmenu = (e) => {
    e.preventDefault();
    pickCellWithMouseRightClick(e);
}



function play() {
    createMines(mines);
    scanAroundAndCountMines();
    
    setMinesLeftIndicator(mines);
    setInterval(() => {
        timer++;
        timerIndicator.innerText = timer;
    }, 1000);
};

function setCanvasDimensions() {
    const canvasComputedWidth = numberOfColumns * gridSize;
    const canvasComputedHeight = numberOfRows * gridSize;
    canvas.width = canvasComputedWidth + 2;
    canvas.height = canvasComputedHeight + 2;
};

function createSafeStartingArea(cell) {
    for(let i = cell.row - 1; i <= cell.row + 1 ; i++) {
        if(minefield[i-1]) {
            for(let j = cell.column - 1; j <= cell.column + 1; j++) {
                if(minefield[i-1][j-1]) {
                    let coords = [i, j];
                    let globalId;
                    if(i < 2) {
                        globalId = j;
                    } else {
                        globalId = ((i-1) * numberOfColumns) + j;
                    }
                    safeStartingArea.push(globalId, coords);


                }
                
            }

        }
    }
};



function createMinefield() {
    for(let i = 0; i < numberOfRows; i++) {
        let rowArr = [];
    
        for(let j = 0; j < numberOfColumns; j++) {
            let coords = [gridSize * j, gridSize * i];
            let obj = new Cell(coords);
            obj.state = 'empty';
            obj.row = i + 1;
            obj.column = j + 1;
            obj.pressed = false;
            obj.flagged = false;
            rowArr.push(obj);
        }
        minefield.push(rowArr);
        
    }
}



function getNewRandomNumber() {
    let randomNumber = getRandomInt(1, numberOfCells);
    if(!minesArr.includes(randomNumber) && !safeStartingArea.includes(randomNumber)) {
        minesArr.push(randomNumber);
    } else {
        getNewRandomNumber();
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createArrOfNumbers(number) {
    for(let i = 0; i < number; i++) {
        getNewRandomNumber();
    }
}

function recursiveRow(x) {
    if(x > numberOfColumns) {
        counter++;
        x = x - numberOfColumns;
        recursiveRow(x);
    } else {
        counter++;
    }
}

function getCellRow (val) {
    recursiveRow(val);
    return counter;
}

function getCellId (val, row) {
   if(val <= numberOfColumns) {
       return val;
   } else {
    return val - ((row -1)  * numberOfColumns)
   }
}

function getCellPosition (val) {
    let cellRow = getCellRow(val);
    let cellId = getCellId(val, cellRow);
    counter = 0;
    return ([cellRow - 1, cellId - 1]);
}




function createMines(minesAmount) {
    createArrOfNumbers(minesAmount);
    minesArr.forEach(id => {
        let row = getCellPosition(id)[0];
        let column = getCellPosition(id)[1];
        minefield[row][column]['state'] = 'mine';
    })
}


function scanAroundAndCountMines() {
    minefield.forEach(line => line.forEach(cell => {
        counter = 0;
        if(cell.state == 'mine') {
            return;
        } else if (cell.state == 'empty')    
        {

            for(let i = cell.row - 1; i <= cell.row + 1 ; i++) {
                if(minefield[i-1]) {
                    for(let j = cell.column - 1; j <= cell.column + 1; j++) {
                        if(minefield[i-1][j-1]) {
                            if(minefield[i-1][j-1]['state'] == 'mine') {
                                counter++;
                            }
                        }
                    }
                }
            }
            cell.minesAmount = counter;
        }
    
    }));
};




function scanAroundAndPressWhenNoMine(cell) {
        let row = cell.row ;
        let column = cell.column ;
        let prop = 'minesAmount';
        let propVal = 0;
        cell.pressed = true;

        for(let i = cell.row - 1; i <= cell.row + 1 ; i++) {
            if(minefield[i-1]) {
                for(let j = cell.column - 1; j <= cell.column + 1; j++) {
                    if(minefield[i-1][j-1]) {
                        if(minefield[i-1][j-1][prop] === propVal &&
                             minefield[i-1][j-1] !== cell && 
                             minefield[i-1][j-1].pressed === false) {
                            scanAroundAndPressWhenNoMine(minefield[i-1][j-1]);
                        }
                    }
                }
            }
        };
            revealAround(cell);
}

function createRect(cell, text) {
    let x = cell.coords[0] + 1;
    let y = cell.coords[1] + 1;
    color = '#bdbdbd';
    let width = gridSize;
    let height = gridSize;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x , y, width, height);
    ctx.closePath();

    if(!cell.pressed){
        ctx.beginPath();
        ctx.fillStyle = 'grey';
        ctx.fillRect(x + width - 3, y, 3, height);
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = 'grey';
        ctx.fillRect(x , y + height - 3, width, 3);
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(x , y, 3, height);
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(x  , y, width, 3);
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = 'grey';
        ctx.fillRect(x + width - 2, y + 2, 1, 1);
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = 'grey';
        ctx.fillRect(x + 2, y + height - 2, 1, 1);
        ctx.closePath();
    } 
    ctx.fillStyle = 'black';
    ctx.font = '15px sans-serif';
    ctx.fillText(text, x + 7, y + 18);
    
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#B26464';
    ctx.strokeRect(cell.coords[0] + 1, cell.coords[1] + 1, gridSize, gridSize);
    ctx.closePath();
};

function drawActive(cell) {
    switch (cell.minesAmount) {
        case 0:
            createRect(cell, '');
            break;
        case 1:
            createRect(cell, '1');
            break;
        case 2:
            createRect(cell, '2');
            break;
        case 3:
            createRect(cell, '3');
            break;
        case 4:
            createRect(cell, '4');
            break;
        case 5:
            createRect(cell, '5');
            break;
        case 6:
            createRect(cell, '6');
            break;
        case 7:
            createRect(cell, '7');
            break;
        case undefined:
            createRect(cell, 'x');
            break;
    }
}

function checkForPressed() {
    minefield.forEach(row => row.forEach(cell => {
        if(cell.pressed === true){
            drawActive(cell);
        }
    }))
}

function drawMinefield() {
    minefield.forEach(line => line.forEach(cell => {
        createRect(cell, '');
    }
    ));
};



const ifNoMines = () => minefield.every(row => row.every(cell => cell.state == 'empty'));




function pickCellWithMouse(e) {
    const mouseX = e.x; 
    const mouseY = e.y; 
    const canvasX = canvasPosition.x;
    const canvasY = canvasPosition.y;
    let cellX = mouseX - canvasX;
    let cellY = mouseY - canvasY;

    minefield.forEach(row => row.forEach(cell => {
        if(cellX >= cell.coords[0] && cellX <= cell.coords[0] + gridSize && 
        cellY >=cell.coords[1] && cellY <= cell.coords[1] + gridSize) {

            if(ifNoMines()) {
                createSafeStartingArea(cell);
                play();
            }
            if(!cell.flagged){
            revealIfEmpty(cell);
            checkForPressed();
            };
        }
    }))
};

function pickCellWithMouseRightClick(e) {
    const mouseX = e.x; 
    const mouseY = e.y; 
    const canvasX = canvasPosition.x;
    const canvasY = canvasPosition.y;
    let cellX = mouseX - canvasX;
    let cellY = mouseY - canvasY;

    minefield.forEach(row => row.forEach(cell => {
        if(cellX >= cell.coords[0] && cellX <= cell.coords[0] + gridSize && cellY >=cell.coords[1] && cellY <= cell.coords[1] + gridSize) {

            if(!cell.pressed){
            toggleFlag(cell);
            
            setMinesLeftIndicator(mineCounter(cell));
            drawFlag(cell);
            };
        }
    }))

};

function mineCounter() {
     let flagCounter = 0;
    minefield.forEach(row => row.forEach(cell => {
        if(cell.flagged) {
            flagCounter++;
        }
    }));

    let minesLeft = mines - flagCounter;
    return minesLeft;
}



function toggleFlag(cell) {
    cell.flagged = !cell.flagged;
}

function drawFlag(cell) {
    if(cell.flagged){
    createRect(cell, 'orange');
    } else if(!cell.flagged) {
        createRect(cell, '#f4f4f4');
    }
}

function revealIfEmpty(cell) {
    if(!(cell.state === 'empty')) {
        drawAllMines();
        setTimeout(() => {
            alert('BOOOOOOOOOOOOOOOOOOOOM! YOU DIE.');
        }, 100);
    } else if (cell.state === 'empty' && cell.minesAmount === 0) {
        scanAroundAndPressWhenNoMine(cell);
    } else if (cell.state === 'empty' && cell.minesAmount > 0) {
        drawActive(cell);
        cell.pressed = true;
    }
}

function drawAllMines() {
    minefield.forEach(row => row.forEach(cell => {
        if(cell.state === 'mine') {
            drawActive(cell);
        }
    }))
}

function revealAround(cell) {
    cell.pressed = true;

    for(let i = cell.row - 1; i <= cell.row + 1 ; i++) {
        if(minefield[i-1]) {
            for(let j = cell.column - 1; j <= cell.column + 1; j++) {
                if(minefield[i-1][j-1]) {
                    minefield[i-1][j-1]['pressed'] = true;
                    }
                }
        }
    }
};




function setMinesLeftIndicator (val) {
    minesLeftIndicator.innerText = val;
}
