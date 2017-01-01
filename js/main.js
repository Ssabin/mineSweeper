'use strict';
/**
 * TODO: BEST SCORE TO EACH BOARD BY USERNAME
 * ADD THE TWO MOUSE BUTTONS EVENT
 */

var gBoard = []; /** The model */
var gLevel = { 
    SIZE: 0, 
    MINES: 0,
    LEVEL: '' 
}; /** This is an object by which the board size is set (in this case: 4*4), and how many mines to put */
var gState = { /** This is an object in which I keep and update the current state */ 
    shownCount: 0, 
    markedCount: 0,
    bestScore: {
        easy: {
            playerName: '',
            time: 5000
        },
        medium: {
            playerName: '',
            time: 5000
        },
        hard: {
            playerName: '',
            time: 5000
        }
    } 
}; 
var gSecsInterval; /** Interval var */
var gTimePassed; /** Timer var */
var gInGame = false; /** if started game this var will be true  */

/** Functions */
/**
 * This is called when player select difficulty
 */
function playerDifficulty(difficultyButton) {
    gInGame = true; /** Game Started */
    var elTable = document.querySelector('table');
    var difficulty = difficultyButton.classList.value;
    switch (difficulty) {
        case 'easy':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            gLevel.LEVEL = 'easy';
            break;
        case 'medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 8;
            gLevel.LEVEL = 'medium';
            break;
        case 'hard':
            gLevel.SIZE = 10;
            gLevel.MINES = 15;
            gLevel.LEVEL = 'hard';
            elTable.style.width = "100%"; /** The board is huge so he needs some more width,100% from the start doesnt look good */
            break;
    }

    /** Init game after setting the right board size and mines. */
    initGame(elTable);

    /** resets time counter */
    if (gSecsInterval) clearInterval(gSecsInterval); 
    gTimePassed = 0;
    gSecsInterval = undefined;
    updateTime();

    /** Html elements actions */
    var elDifficulties = document.querySelector('.difficulties'); /** Hiddes difficulties button */
    elDifficulties.style.display = 'none';
    var elFlagsCount = document.querySelector('#flagsCount');
    elFlagsCount.innerText = gLevel.MINES; /** Sets flags count to the amount of mines */
}


/** 
 * This is called when difficulty selected 
 * Sets mines indexes, build and renders the board
 * */

function initGame(elTable) {
    elTable.style.display = 'table';
    getBestScores();
    var minesIndxs = minesPositions(); /** Array with random mines positions */
    gBoard = buildBoard(minesIndxs); /** creates game board */
    renderBoard(); /** rendering board to table in html */
}

/**
 * Updates time without miliseconds
 */
function updateTime() {
    var elSpanTimer = document.getElementById('spanTimer');
    elSpanTimer.innerText = parseInt(gTimePassed / 10);
}


/** 
 * Creates mines indexes array.
*/
function minesPositions() {
    var arr = [];
    var mineI = 0;
    var mineJ = 0;
    for (var i = 0; i < gLevel.MINES; i++) {
        mineI = getRandomInt(0, gLevel.SIZE - 1);
        mineJ = getRandomInt(0, gLevel.SIZE - 1);
        arr.push({ mineI: mineI, mineJ: mineJ });
    }
    return arr;
}

/**
 * Builds the board by setting mines at random locations, 
 * and then calling the setMinesNegsCount() 
 * Then return the created board
 */

function buildBoard(mineIndxs) {
    var board = [];
    var countMines = 0; /** Counts mines inserted to the matrix */
    for (var i = 0; i < gLevel.SIZE; i++) {
        var arr = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            arr.push({type: 'empty' , isShown: false ,isFlagged: false});
        }
        board.push(arr);
    }
    setMineLocation(mineIndxs, board);
    setMinesNegsCount(board, mineIndxs); /** Sets neighbours count in cells surronding mine */
    return board;
}



/**
 * Sets mines in board and avoiding duplicates
 */
function setMineLocation(mineIndxs, board) {
    var mineArrayIndx = 0;
    while (mineArrayIndx < mineIndxs.length) {
        if (board[mineIndxs[mineArrayIndx].mineI][mineIndxs[mineArrayIndx].mineJ].type === 'mine') {
            /** There is already a mine there, random a new one */
            mineIndxs[mineArrayIndx].mineI = getRandomInt(0, gLevel.SIZE - 1);
            mineIndxs[mineArrayIndx].mineJ = getRandomInt(0, gLevel.SIZE - 1);
        } else {
            board[mineIndxs[mineArrayIndx].mineI][mineIndxs[mineArrayIndx].mineJ] = {type:'mine', isShown: false ,isFlagged: false};
            mineArrayIndx++;
        }
    }
}

/**
 * Sets mines-count to neighbours of mine
 * TODO: FIX BOUNDRIES
 */
function setMinesNegsCount(board, mineIndxs) {
    for (var i = 0; i < mineIndxs.length; i++) {
        for (var boardI = mineIndxs[i].mineI - 1; boardI <= mineIndxs[i].mineI + 1; boardI++) {
            for (var boardJ = mineIndxs[i].mineJ - 1; boardJ <= mineIndxs[i].mineJ + 1; boardJ++) {
                if (boardI === mineIndxs[i].mineI && boardJ === mineIndxs[i].mineJ) continue;
                if (boardI < 0 || boardI > board.length - 1) continue;
                if (boardJ < 0 || boardJ > board.length - 1) continue;
                if (board[boardI][boardJ].type === 'empty') board[boardI][boardJ] = {type:'neg' , negCount: 1 , isShown: false , isFlagged: false };
                else if (board[boardI][boardJ].type !== 'mine') board[boardI][boardJ].negCount++;
            }
        }
    }
}


/**
 * Print the board as a table
 */
function renderBoard() {
    var strHTML = '';
    gBoard.forEach(function (cells, i) {
        strHTML += '<tr>';
        cells.forEach(function (cell, j) {
            // created td with id that represent location on board , and an onmousedown att.
            strHTML += '<td class="hidden" id="' + i + ',' + j + '" onmousedown="cellClicked(event,this,' + i + ',' + j + ')" ></td>';
        });
    });

    /** Renders strHTML to tbale on HTML */
    var elMineSweeperBoard = document.querySelector('#mineSweeperBoard');
    elMineSweeperBoard.innerHTML = strHTML;
}


/**
 * Called when a cell (td) is clicked
 */
function cellClicked(e, elCell, i, j) {
    if (!gInGame) return; /** if game is over and trying to click on cell */
    if (!gSecsInterval) { /** if first click , start timer */
        gSecsInterval = setInterval(function () {
            gTimePassed++;
            updateTime();
        }, 100)
    }
    if (isCellShown(i , j)) return; /** if this cell is already shown than don't continue */
    if (e.button === 0) {
        if(isCellFlagged(i , j)) return; /** Cant open cell that is flagged */
        switch (gBoard[i][j].type) {
            case 'mine': showCell(elCell, i, j); gameOver(); break;
            case 'empty': expandShown(i, j); break; /** Show cell */
            default: showCell(elCell, i, j);
        }
    } else if (e.button === 2) { /** Right click was pressed */
        cellMarked(elCell, i , j);
    }
    checkGameOver();
}

/**
 * Toggles hidden cell 
 */
function showCell(elCell, i, j) {
    if (isCellShown(i , j)) return; 
    if (gState.shownCount === 0) { /** First cell , show play again button */
        var elPlayAgain = document.querySelector('.playAgain');
        elPlayAgain.style.display = 'block';
    }
    elCell.classList.remove('hidden');
    gBoard[i][j].isShown = true;
    if (gBoard[i][j].type === 'mine') elCell.classList.add('mine');
    else elCell.innerText = gBoard[i][j].type === 'neg' ? gBoard[i][j].negCount : ''; /** gets text from mat ,,WILL WORK?*/
    gState.shownCount++;
}

/**
 * Called on right click to mark a cell as suspected to have a mine
 */
function cellMarked(elCell , i , j) {
    var elFlagsCount = document.querySelector('#flagsCount');
    if (isCellFlagged(i , j)) {
        elCell.classList.remove('marked');
        gBoard[i][j].isFlagged = false;
        gState.markedCount--;
        elFlagsCount.innerText = gLevel.MINES - gState.markedCount; /** Updates flag count on HTML */
        return;
    }
    if (gState.markedCount < gLevel.MINES) {
        elCell.classList.add('marked');
        gBoard[i][j].isFlagged = true;
        gState.markedCount++;
        elFlagsCount.innerText = gLevel.MINES - gState.markedCount; /** Updates flag count on HTML */
    } else {
        document.querySelector('#messages').innerText = 'You cant flag more cells than the mines you have'; /** Show error message */
    }
}

/**
 *  The game is over in this scenarios:
 *  1. All mines are flagged and you have shown all other cells
 *  2. All cells that aren't mines have been shown
 */

function checkGameOver() {
    if ((gState.markedCount === gLevel.MINES &&
        gState.shownCount >= (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) ||
        gState.shownCount >= (gLevel.SIZE * gLevel.SIZE) - gLevel.MINES) {
        gInGame = false; /** Sets game boolean false */
        saveBestScore();
        var elMessages = document.querySelector('#messages');
        elMessages.innerText = 'You Win!!!';
        clearInterval(gSecsInterval); /** Clears time interval */
    }
}


function saveBestScore () {
    var gameTime = gTimePassed / 10;
    var playerName = localStorage.userName;
    //check if score is better
    if(gameTime > gState.bestScore[gLevel.LEVEL].time) return;
    //save to state
    gState.bestScore[gLevel.LEVEL].playerName = localStorage.userName;
    gState.bestScore[gLevel.LEVEL].time = gTimePassed / 10;
    var elBestScore = document.querySelector('#bestScore');
    elBestScore.innerHTML = 'Best score: ' + gState.bestScore[gLevel.LEVEL].time  +'\'s By: ' + gState.bestScore[gLevel.LEVEL].playerName;
    //save to localhost
    localStorage.bestScore = JSON.stringify(gState.bestScore);
}

function getBestScores(){
    if (!localStorage.bestScore){
        localStorage.bestScore = JSON.stringify(gState.bestScore);
        return;
    } else {
        gState.bestScore = JSON.parse(localStorage.bestScore);
        if(gState.bestScore[gLevel.LEVEL].playerName !== ''){
            var elBestScore = document.querySelector('#bestScore');
        elBestScore.innerHTML = 'Best score: ' + gState.bestScore[gLevel.LEVEL].time  +'\' By: ' + gState.bestScore[gLevel.LEVEL].playerName;
        } 
    }
}

/** 
 * Called when mine was clicked.
 */
function gameOver() {
    gInGame = false; /** Sets game boolean false */
    var elMessages = document.querySelector('#messages');
    elMessages.innerText = 'You Lose!!!';
    clearInterval(gSecsInterval); /** Clears time interval */
    shakeBoard();
}

function shakeBoard(){
    var timer = 0;
    var elTable = document.querySelector('table');
    var elBang = document.querySelector('.bang');
    elTable.classList.add('shake-crazy');
    elBang.style.display = 'block';
    var shakeInterval = setInterval(function(){
        if(timer > 3){
            elTable.classList.remove('shake-crazy');
            elBang.style.display = 'none';
            clearInterval(shakeInterval)
        } 
        timer++;
    } , 500);
}

/**
 * Expand the shown class to neighbors of empty cell
 * using recursion on each cell negs
 */
function expandShown(i, j) {
    /** Getting current element */
    var cellId = i + ',' + j;
    var elCell = document.getElementById(cellId);

    /** If Cell contains mine */
    if (gBoard[i][j].type === 'mine') return;

    /** If cell is already shown */
    if (isCellShown(i , j)) return;
    
    /** If cell is flagged , don't open */
    if (isCellFlagged(i , j)) return;

    /** If cell is neg of mine*/
    if (gBoard[i][j].type === 'neg') {
        showCell(elCell, i, j);
        return;
    }

    /** taking care of empty cell */
    showCell(elCell, i, j); /** Show current cell */


    /** Sending all cell negs to open them by the rulles */

    /** Checks if in row boundries , if not start from boundry*/
    var indexI = i - 1 < 0 ? 0 : i - 1;
    var limitI = i + 1 > gBoard.length - 1 ? gBoard.length - 1 : i + 1;

    for (; indexI <= limitI; indexI++) {

        /** Checks if in Col boundries , if not start from boundry*/
        var indexJ = j - 1 < 0 ? 0 : j - 1;
        var limitJ = j + 1 > gBoard.length - 1 ? gBoard.length - 1 : j + 1;

        for (; indexJ <= limitJ; indexJ++) {
            if (indexI === i && indexJ === j) continue;
            expandShown(indexI, indexJ);
        }
    }
}

/**
 * if cell is shown return true, else false
 */
function isCellShown(i,j) {
    return gBoard[i][j].isShown ? true : false;
}

/**
 * if cell is marked return true, else false
 */
function isCellFlagged(i,j) {
    return gBoard[i][j].isFlagged ? true : false;
}

/**
 * Reset the game wether player won,lost or just want to start over
 */
function resetGame() {
    clearInterval(gSecsInterval); /** Clears time interval */
    var elMessages = document.querySelector('#messages');
    elMessages.innerText = ''; /** Clears message */
    gBoard = []; /** Clears board */
    gState = { shownCount: 0, markedCount: 0 , bestScore: gState.bestScore }; /** Clears counters */
    var elBestScore = document.querySelector('#bestScore');
    elBestScore.innerHTML = '';
    var elPlayAgain = document.querySelector('.playAgain');
    elPlayAgain.style.display = 'none'; /** Button play again to dissapper */
    var elDifficulties = document.querySelector('.difficulties');
    elDifficulties.style.display = 'block';
}

function getUser(){
    var userName =  localStorage.userName;
    if(userName === '' || !userName){
        userName = prompt('Enter your name');
    }
    var elUserName = document.querySelector('#userName');
    elUserName.innerText = userName;
    localStorage.userName = userName;
}
function changeUser(){
    var userName = prompt('Enter your name');
    var elUserName = document.querySelector('#userName');
    elUserName.innerText = userName;
    localStorage.userName = userName;
}
