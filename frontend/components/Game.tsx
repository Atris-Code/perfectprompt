import React, { useState, useEffect, useCallback } from 'react';
import { generateSudoku } from '../utils/sudoku';
import type { Board, Difficulty } from '../types';

export const Game: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [errors, setErrors] = useState<{ row: number; col: number }[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  const newGame = useCallback(() => {
    const { puzzle, solution } = generateSudoku(difficulty);
    setInitialBoard(puzzle.map(row => [...row]));
    setBoard(puzzle.map(row => [...row]));
    setSolution(solution);
    setSelectedCell(null);
    setErrors([]);
    setIsSolved(false);
  }, [difficulty]);

  useEffect(() => {
    newGame();
  }, [newGame]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === null) {
      setSelectedCell({ row, col });
      setErrors([]); // Clear errors when a new cell is selected
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell || isSolved) return;

    const { row, col } = selectedCell;

    if (e.key >= '1' && e.key <= '9') {
      const num = parseInt(e.key);
      setBoard(prev => {
        const newBoard = prev.map(r => [...r]);
        newBoard[row][col] = num;
        return newBoard;
      });
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      setBoard(prev => {
        const newBoard = prev.map(r => [...r]);
        newBoard[row][col] = null;
        return newBoard;
      });
    }
  }, [selectedCell, isSolved]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleCheck = () => {
    const newErrors: { row: number; col: number }[] = [];
    let isCompleteAndCorrect = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === null) {
            isCompleteAndCorrect = false;
        } else if (initialBoard[r][c] === null && board[r][c] !== solution[r][c]) {
          newErrors.push({ row: r, col: c });
          isCompleteAndCorrect = false;
        }
      }
    }
    setErrors(newErrors);
    if(isCompleteAndCorrect){
        setIsSolved(true);
        alert("¡Felicidades, has resuelto el Sudoku!");
    } else if (newErrors.length === 0) {
        alert("Hasta ahora todo es correcto, ¡sigue así!");
    }
  };

  const handleSolve = () => {
    setBoard(solution);
    setIsSolved(true);
    setErrors([]);
  };

  const isError = (row: number, col: number) => errors.some(e => e.row === row && e.col === col);

  return (
    <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg w-full max-w-4xl mx-auto">
      <header className="text-center mb-6">
        <h2 className="text-3xl font-bold">Juego de Sudoku</h2>
        <p className="mt-2 text-md text-slate-400">Pon a prueba tu lógica y concentración.</p>
      </header>

      <div className="flex justify-center gap-4 mb-6">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              difficulty === d ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-9 bg-slate-800 border-4 border-slate-700 rounded-md p-1 aspect-square w-full max-w-lg">
          {board.map((row, rIndex) =>
            row.map((cell, cIndex) => {
              const isInitial = initialBoard[rIndex]?.[cIndex] !== null;
              const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
              
              let cellClasses = 'flex items-center justify-center text-2xl font-bold aspect-square transition-colors duration-150 ';
              cellClasses += `border-r border-b ${((cIndex + 1) % 3 === 0 && cIndex !== 8) ? 'border-r-slate-600' : 'border-r-slate-700'} ${((rIndex + 1) % 3 === 0 && rIndex !== 8) ? 'border-b-slate-600' : 'border-b-slate-700'} `;
              
              if (isInitial) {
                cellClasses += 'text-slate-300 ';
              } else {
                cellClasses += 'cursor-pointer ';
                if(isSelected) cellClasses += 'bg-blue-900/50 ';
                else cellClasses += 'hover:bg-slate-700/50 ';
                
                if (isError(rIndex, cIndex)) cellClasses += 'text-red-500 ';
                else cellClasses += 'text-cyan-400 ';
              }

              return (
                <div key={`${rIndex}-${cIndex}`} className={cellClasses} onClick={() => handleCellClick(rIndex, cIndex)}>
                  {cell}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={newGame} className="px-6 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600">Nuevo Juego</button>
        <button onClick={handleCheck} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Comprobar</button>
        <button onClick={handleSolve} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">Resolver</button>
      </div>
    </div>
  );
};
