import React, { useState } from 'react';
import { motion } from 'motion/react';

interface Cell {
  row: number;
  col: number;
  answer: string;
  number?: number;
  isBlack?: boolean;
}

export default function Crossword() {
  // 7x7 Grid
  // Across: 
  // 1. EMMA (0,0 to 0,3)
  // 4. TWO (2,0 to 2,2)
  // 6. DHONI (4,0 to 4,4)
  // 7. LEO (6,0 to 6,2)
  // Down:
  // 1. EMMA (0,0 to 3,0) - wait, EMMA is 4 letters.
  // 2. SIX (0,2 to 2,2)
  // 3. BIRYANI (0,3 to 6,3)
  // 5. TWO (2,0 to 4,0) - wait, this is getting complex.

  // Let's simplify to a 5x5 grid with 4-5 key words.
  // 1. EMMA (Across 1)
  // 2. LEO (Down 1)
  // 3. TWO (Across 3)
  // 4. DHONI (Down 2)
  // 5. SIX (Across 5)

  const gridData: (Cell | null)[][] = [
    [null, null, { row: 0, col: 2, answer: 'L', number: 1 }, null, null, { row: 0, col: 5, answer: 'K', number: 4 }, null, null],
    [null, null, { row: 1, col: 2, answer: 'E', number: 2 }, { row: 1, col: 3, answer: 'M' }, { row: 1, col: 4, answer: 'M' }, { row: 1, col: 5, answer: 'A' }, null, null],
    [{ row: 2, col: 0, answer: 'D', number: 3 }, { row: 2, col: 1, answer: 'H' }, { row: 2, col: 2, answer: 'O' }, { row: 2, col: 3, answer: 'N' }, { row: 2, col: 4, answer: 'I' }, { row: 2, col: 5, answer: 'J' }, null, null],
    [null, null, null, null, null, { row: 3, col: 5, answer: 'U' }, null, null],
    [null, null, null, null, null, { row: 4, col: 5, answer: 'K' }, null, null],
    [null, null, null, null, null, { row: 5, col: 5, answer: 'A' }, null, null],
    [null, null, null, null, null, { row: 6, col: 5, answer: 'T', number: 5 }, { row: 6, col: 6, answer: 'W' }, { row: 6, col: 7, answer: 'O' }],
    [null, null, null, null, null, { row: 7, col: 5, answer: 'L' }, null, null],
    [null, null, null, null, { row: 8, col: 4, answer: 'S', number: 6 }, { row: 8, col: 5, answer: 'I' }, { row: 8, col: 6, answer: 'X' }, null],
  ];

  const [userGrid, setUserGrid] = useState<string[][]>(
    Array(9).fill(null).map(() => Array(8).fill(''))
  );

  const handleChange = (r: number, c: number, val: string) => {
    const newGrid = [...userGrid];
    newGrid[r][c] = val.toUpperCase().slice(-1);
    setUserGrid(newGrid);
  };

  const isCorrect = (r: number, c: number) => {
    return userGrid[r][c] === gridData[r][c]?.answer;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-8 gap-1 mb-6 bg-ink p-1 border-2 border-ink">
        {gridData.map((row, r) => (
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`} 
              className={`w-8 h-8 relative ${cell ? 'bg-white' : 'bg-ink'}`}
            >
              {cell && (
                <>
                  {cell.number && (
                    <span className="absolute top-0.5 left-0.5 text-[7px] font-mono leading-none">{cell.number}</span>
                  )}
                  <input
                    type="text"
                    value={userGrid[r][c]}
                    onChange={(e) => handleChange(r, c, e.target.value)}
                    className={`w-full h-full text-center font-mono font-bold text-sm focus:outline-none focus:bg-ink/5 transition-colors ${
                      userGrid[r][c] && (isCorrect(r, c) ? 'text-green-700' : 'text-red-700')
                    }`}
                  />
                </>
              )}
            </div>
          ))
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8 w-full text-[10px] font-mono uppercase">
        <div className="space-y-2">
          <h4 className="font-black border-b border-ink/20 pb-1">Across</h4>
          <p>2. All-time celebrity crush (4)</p>
          <p>3. His favorite cricketer (5)</p>
          <p>5. Number of weddings hosted (3)</p>
          <p>6. The height he claims (3)</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-black border-b border-ink/20 pb-1">Down</h4>
          <p>1. His cat's name (3)</p>
          <p>4. His favourite guilty pleasure (Calm down — it’s edible. This one’s a dessert 😜) (9)</p>
        </div>
      </div>
      
    </div>
  );
}
