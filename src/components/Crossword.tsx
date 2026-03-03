import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, CheckCircle2, User, Send, Quote } from 'lucide-react';


interface Cell {
  row: number;
  col: number;
  answer: string;
  number?: number;
  isBlack?: boolean;
}

interface Score {
  id: number;
  player_name: string;
  score: number;
  time_taken: number;
  timestamp: string;
}

export default function Crossword() {
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
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [scores, setScores] = useState<Score[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const timerRef = useRef<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(setScores);

    // Real-time updates removed for Vercel compatibility. Use polling if needed.
  }, []);

  useEffect(() => {
    if (startTime && !endTime) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, endTime]);

  const handleChange = (r: number, c: number, val: string) => {
    if (isCompleted) return;
    if (!startTime) setStartTime(Date.now());

    const newGrid = [...userGrid];
    newGrid[r][c] = val.toUpperCase().slice(-1);
    setUserGrid(newGrid);

    // Check if everything is correct
    let allCorrect = true;
    let anyEmpty = false;
    gridData.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (cell) {
          if (newGrid[ri][ci] !== cell.answer) allCorrect = false;
          if (!newGrid[ri][ci]) anyEmpty = true;
        }
      });
    });

    if (allCorrect && !anyEmpty) {
      setIsCompleted(true);
      setEndTime(Date.now());
    }
  };

  const isCorrect = (r: number, c: number) => {
    return userGrid[r][c] === gridData[r][c]?.answer;
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const timeTaken = endTime && startTime ? Math.floor((endTime - startTime) / 1000) : elapsedTime;
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName,
          score: 100, // Fixed score for completion for now
          time_taken: timeTaken
        })
      });
      if (res.ok) {
        setHasSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto px-4">
      <div className="flex justify-between w-full mb-4 items-center">
        <div className="flex items-center gap-2 text-ink/60 font-mono text-xs uppercase tracking-widest">
          <Timer className="w-4 h-4" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Puzzle Solved!</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-8 gap-1 mb-8 bg-ink p-1 border-2 border-ink shadow-2xl">
        {gridData.map((row, r) => (
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`} 
              className={`w-8 h-8 sm:w-10 sm:h-10 relative ${cell ? 'bg-white' : 'bg-ink'}`}
            >
              {cell && (
                <>
                  {cell.number && (
                    <span className="absolute top-0.5 left-0.5 text-[7px] font-mono leading-none z-10">{cell.number}</span>
                  )}
                  <input
                    type="text"
                    value={userGrid[r][c]}
                    disabled={isCompleted}
                    onChange={(e) => handleChange(r, c, e.target.value)}
                    className={`w-full h-full text-center font-mono font-bold text-lg focus:outline-none focus:bg-ink/5 transition-colors ${
                      userGrid[r][c] && (isCorrect(r, c) ? 'text-green-700' : 'text-red-700')
                    } ${isCompleted ? 'bg-green-50' : ''}`}
                  />
                </>
              )}
            </div>
          ))
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-12">
        <div className="space-y-4">
          <h4 className="font-black border-b border-ink/20 pb-2 text-xs uppercase tracking-widest flex items-center gap-2">
            <Quote className="w-3 h-3" />
            Clues
          </h4>
          <div className="grid grid-cols-1 gap-6 text-[11px] font-mono uppercase leading-relaxed">
            <div className="space-y-2">
              <span className="text-ink/40 font-bold block">Across</span>
              <p>2. All-time celebrity crush (4)</p>
              <p>3. His favorite cricketer (5)</p>
              <p>5. Number of weddings hosted (3)</p>
              <p>6. The height he claims (3)</p>
            </div>
            <div className="space-y-2">
              <span className="text-ink/40 font-bold block">Down</span>
              <p>1. His cat's name (3)</p>
              <p>4. His favourite guilty pleasure (Calm down — it’s edible. This one’s a dessert 😜) (9)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-black border-b border-ink/20 pb-2 text-xs uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-3 h-3" />
            Leaderboard
          </h4>
          <div className="bg-white/50 rounded-lg p-4 border border-ink/5 min-h-[200px]">
            {scores.length === 0 ? (
              <div className="h-full flex items-center justify-center text-ink/30 font-mono text-[10px] uppercase">
                No scores yet. Be the first!
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((s, idx) => (
                  <div key={s.id} className="flex justify-between items-center font-mono text-[10px] uppercase border-b border-ink/5 pb-1 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-ink/30 w-4">{idx + 1}.</span>
                      <span className="font-bold">{s.player_name}</span>
                    </div>
                    <span className="text-ink/60">{formatTime(s.time_taken)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCompleted && !hasSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-ink text-white p-6 rounded-2xl shadow-2xl mb-12"
          >
            <h3 className="font-serif italic text-2xl mb-4 text-center">Victory!</h3>
            <p className="text-xs font-mono uppercase tracking-widest text-center mb-6 opacity-70">
              You solved it in {formatTime(elapsedTime)}
            </p>
            <form onSubmit={handleSubmitScore} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input 
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-ink font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Score
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
