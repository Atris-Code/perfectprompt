import { Board, Difficulty } from '../types';

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const createEmptyBoard = (): Board => {
  return Array(9).fill(null).map(() => Array(9).fill(null));
};

const solveSudoku = (board: Board): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const isValid = (board: Board, row: number, col: number, num: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) {
      return false;
    }
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) {
        return false;
      }
    }
  }

  return true;
};

const generateFullSudoku = (): Board => {
    const board = createEmptyBoard();
    solveSudoku(board);
    return board;
};

export const generateSudoku = (difficulty: Difficulty): { puzzle: Board; solution: Board } => {
  const solution = generateFullSudoku();

  const puzzle: Board = solution.map(row => [...row]);

  const emptyCellsByDifficulty: Record<Difficulty, number> = {
    easy: 35,
    medium: 45,
    hard: 55,
  };
  const emptyCells = emptyCellsByDifficulty[difficulty];

  let cellsToRemove = emptyCells;
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      cellsToRemove--;
    }
  }

  return { puzzle, solution };
};
