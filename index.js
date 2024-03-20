function validPlacement(row, col, value) { // checks if its a valid placement
    // check in cols
    for (let c=0; c<9; c++)
        if (value === Sudoku[row][c])
            return false;
    // check in rows
    for (let r=0; r<9; r++)
        if (value === Sudoku[r][col])
            return false;
    // check in subgrid
    let sgbr = parseInt(row / 3) * 3; // subgrid-base row
    let sgbc = parseInt(col / 3) * 3; // subgrid-base col

    for (let r=0; r < 3; r++) {
        for (let c=0; c < 3; c++) {
            let sgr = sgbr + r; // subgrid row
            let sgc = sgbc + c; // subgrid col
            if (Sudoku[sgr][sgc] === value)
                return false;
        }
    }
    // console.log('valid in subgrid')
    return true;
}

function sleep(ms) { // sleeps ms amount of milliseconds
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function solve(row, col) { // solves the current board
    let fast = document.querySelector('#speed').checked;
    if (col === 9 && row === 8)
        return true; // no more backtracking, solving finished
    
    if (col === 9) { // if we have reached the end of the columns
        row++; // go to next row
        col = 0; 
    }
    if (Sudoku[row][col] > 0)
        return solve(row, col+1);

    for (let value=1; value <= 9; value++) {
        if (validPlacement(row, col, value)) {
            refreshBoard();
            if (!fast)
                await sleep(20);
            Sudoku[row][col] = value;
            if (await solve(row, col+1))
                return true;
        }
        Sudoku[row][col] = 0;
    }
    return false;
}

function generate(row, col) { // generates a new sudoku board
    if (col === 9 && row === 8)
        return true; // no more backtracking, solving finished
    
    if (col === 9) { // if we have reached the end of the columns
        row++; // go to next row
        col = 0; 
    }

    if (Sudoku[row][col] > 0)
        return generate(row, col+1);

    const shuffle = (array) => {
        for (let i=array.length-1; i > 0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const numbers = shuffle([1,2,3,4,5,6,7,8,9])

    for (let i=0; i < numbers.length; i++) {
        let value = numbers[i];
        if (validPlacement(row, col, value)) {
            Sudoku[row][col] = value;
            if (generate(row, col+1))
                return true;
            else
                Sudoku[row][col] = 0; // backtrack
        }
    }
    return false;
}

function removeCells() { // removes a random amount of cells from the board
    for (let row=0; row < 9; row++) {
        for (let col=0; col < 9; col++) {
            const rand = Math.random();
            if (rand > 0.5) {
                Sudoku[row][col] = 0;
            }
        }
    }
}

function clearBoard() { // clears the board
    for (let row=0; row < 9; row++) {
        for (let col=0; col < 9; col++) {
            let input = document.querySelector(`#s${row}-${col}`);
            input.disabled = false;
            Sudoku[row][col] = 0;
        }
    }
}

function refreshBoard(isFirst) { // refreshes display
    for (let row=0; row < 9; row++) {
        for (let col=0; col < 9; col++) {
            let input = document.querySelector(`#s${row}-${col}`)
            input.value = Sudoku[row][col] == 0 ? '' : Sudoku[row][col];
            if (isFirst && Sudoku[row][col] !== 0) {
                input.disabled = true;
            }
        }
    }
}

function checkWin() { // check if player has won
    for (let row=0; row < 9; row++) {
        if (Sudoku[row].includes(0))
            return false;
    }
    return true;
}

// each array is a row
let Sudoku = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

let sudoku = document.querySelector('#sudoku');
for (let row=0; row < 9; row++) {
    let cell = document.createElement('div');
    for (let col=0; col < 9; col++) {
        let input = document.createElement('input')
        input.setAttribute('id', `s${row}-${col}`)
        input.addEventListener('change', () => {
            const VALUE = parseInt(input.value);
            if ( !isNaN(VALUE) ) {
                if (VALUE >= 1 && VALUE <= 9) {
                    if (!validPlacement(row, col, VALUE)) {
                        input.value = '';
                    } else {
                        Sudoku[row][col] = VALUE;
                        input.value = VALUE
                        // check if win
                        if (checkWin()) {
                            console.log('winner winner chicken dinner');
                        }
                    }
                }
                else {
                    Sudoku[row][col] = 0;
                    input.value = '';
                }
            } else { // inputed a non-number
                Sudoku[row][col] = 0;
                input.value = '';
            }
        });
        cell.appendChild(input);
    }
    sudoku.appendChild(cell);
}


const generateBtn = document.querySelector('#gen-btn');
generateBtn.addEventListener('click', () => {
    console.log('generating...');
    generate(0,0);
    removeCells();
    refreshBoard(true);
});

const solveBtn = document.querySelector('#solve-btn');
solveBtn.addEventListener('click', async () => {
    console.log('solving...')
    await solve(0,0);
    refreshBoard();
});

const clearBtn = document.querySelector('#clear-btn');
clearBtn.addEventListener('click', () => {
    clearBoard();
    refreshBoard();
});