import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import VersionGallery from './components/VersionGallery';
import Crossword from './components/Crossword';
import { Sparkles, Check } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io();

export default function App() {
  const currentDate = "Wednesday, March 4, 2026";
  const [checkedBingo, setCheckedBingo] = useState<boolean[]>(new Array(9).fill(false));
  const [scores, setScores] = useState<{id?: number, name: string, score: number}[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch initial scores
    fetch('/api/bingo-scores')
      .then(res => res.json())
      .then(data => {
        setScores(data.map((s: any) => ({ id: s.id, name: s.player_name, score: s.score })));
      });

    // Listen for new scores
    socket.on('new_bingo_score', (newScore: any) => {
      setScores(prev => {
        const mapped = { id: newScore.id, name: newScore.player_name, score: newScore.score };
        if (prev.some(s => s.id === mapped.id)) return prev;
        return [mapped, ...prev].sort((a, b) => b.score - a.score).slice(0, 10);
      });
    });

    return () => {
      socket.off('new_bingo_score');
    };
  }, []);

  const bingoItems = [
    "Went on a road trip together",
    "Hosted your wedding",
    "Helped to capture a perfect picture to post",
    "Gave you a massage :P",
    "Cooked his special white sauce pasta for you",
    "Gone to a music fest",
    "Have recited his shayari/poem to you",
    "Watched sports (cricket, olympics) or played chess",
    "Listened to you when you were down and have been there for you"
  ];

  const toggleBingo = (index: number) => {
    const newChecked = [...checkedBingo];
    newChecked[index] = !newChecked[index];
    setCheckedBingo(newChecked);
  };

  const submitScore = async () => {
    if (!playerName.trim() || isSubmitting) return;
    const currentScore = checkedBingo.filter(Boolean).length;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bingo-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: playerName,
          score: currentScore
        })
      });
      
      if (res.ok) {
        setPlayerName("");
        // Score will be updated via socket
      }
    } catch (err) {
      console.error('Failed to submit bingo score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-ink selection:text-paper py-10">
      {/* Breaking News Ticker */}
      <div className="fixed top-0 left-0 w-full z-[100] breaking-news">
        <div className="animate-marquee">
          CRICBUZZ UPDATE: ADITYA CHECKS SCORE FOR THE 400TH TIME TODAY • CHESS.COM SERVERS STRUGGLE TO KEEP UP WITH ADITYA'S BLITZ STREAK • LATE NIGHT WALK SCHEDULED FOR 2 AM • SHAYARI COLLECTION NEARING COMPLETION • FRIENDS DECLARE ADITYA "MOST CONSISTENT" • HIGH EQ ALERT: ADITYA ALREADY KNEW YOU WERE GOING TO READ THIS • OLYMPICS UPDATE: ADITYA WATCHING ARCHERY AND CURLING AT THE SAME TIME • 
        </div>
      </div>

      <div className="newspaper-container">
        <div className="newspaper-fold" />
        {/* Masthead */}
        <header className="masthead">
          <div className="flex justify-between items-end mb-4 font-mono text-[10px] uppercase tracking-widest opacity-60">
            <span>Vol. XXX — No. 30</span>
            <span>Established 1996</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-serif font-black uppercase tracking-tighter mb-2 halftone">
            The Birthday Gazette
          </h1>
          <div className="sub-masthead">
            <div className="flex gap-4">
              <span>{currentDate}</span>
              <span className="border-l border-ink pl-4 font-bold uppercase tracking-widest">Latest Edition: The Aditya Special</span>
            </div>
            <div className="flex gap-4">
              <span className="border-r border-ink pr-4">Price: One Checkmate</span>
              <span>Est. March 4, 1996</span>
            </div>
          </div>
        </header>

        {/* Main Headline Section */}
        <section className="mb-12 border-b-4 border-ink pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-6xl md:text-8xl headline uppercase leading-[0.9]">
                  The Man, <br />
                  The Myth, <br />
                  The Statistical <br />
                  Anomaly
                </h2>
                <div className="article-columns">
                  <p className="dropcap text-lg leading-snug mb-4">
                    Aditya, a man who can calculate the trajectory of a cricket ball while simultaneously losing a blitz chess game, enters his thirties with the same "consistency" that makes him refresh Cricbuzz during a funeral. 
                    His friends describe him as "super responsible," which is mostly code for "is the only one trusted to hold the mic while cheering for the bride and groom at every wedding."
                  </p>
                  
                  <p className="text-lg leading-snug mb-4">
                    Known for an EQ so high it's practically intrusive, Aditya claims to know what's in your heart before you do. 
                    Usually, it's just a desire for him to put his phone down and acknowledge the physical world. Whether it's the Olympics, a random kabaddi match in rural India, or a 3 AM Icelandic handball final, if it has a score, he's watching it.
                  </p>

                  <blockquote className="border-y-2 border-ink py-6 my-8 text-3xl font-serif font-black italic leading-tight text-center halftone">
                    "I don't just watch sports; I inhabit the scoreboard."
                  </blockquote>

                  <p className="text-lg leading-snug mb-4">
                    Beyond the screen, he is a master of the "Aditya Touch"—a legendary massage technique that has earned him a dedicated following among his female friends. 
                    When he's not fixing your posture, he's likely in the kitchen perfecting his signature white sauce pasta, a dish so consistent it has its own fan club.
                  </p>
                  <p className="text-lg leading-snug">
                    His late-night walks have become local legend—mostly because neighbors wonder if he's a deep-thinking shayari master or just a man who forgot where he parked. 
                    As he turns 30, we celebrate the man who is fit enough to walk for hours but still can't resist a 5-minute break to check the ELO rating of a grandmaster he'll never meet.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:col-span-3 border-l-2 border-ink/10 pl-8">
              {/* Editorial */}
              <div className="bg-ink/5 p-6 border border-ink/10 mb-8">
                <h3 className="font-serif font-black uppercase text-xl mb-4 border-b border-ink pb-2">Editorial</h3>
                <p className="italic text-sm leading-relaxed mb-4">
                  "In Aditya, we see the rare blend of a strategic mind and a soul that refuses to stop refreshing Cricbuzz. His consistency is his superpower—mostly used to maintain the same facial expression regardless of whether he's winning a multi-million dollar deal or losing a pawn in a blitz game. His empathy is his guide, primarily used to sense when his friends are about to roast him so he can quickly pivot to a sports trivia question."
                </p>
                <div className="flex items-center gap-2 mt-6">
                  <div className="w-10 h-10 rounded-full bg-ink/20" />
                  <div>
                    <p className="text-[10px] font-mono uppercase font-black">The Editor</p>
                    <p className="text-[8px] font-mono uppercase opacity-40">March 4, 2026</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-serif font-black uppercase text-xl mb-4 border-b border-ink pb-2">Weather</h3>
                <div className="flex items-center gap-4">
                  <Sparkles className="w-8 h-8" />
                  <div>
                    <p className="font-mono text-xs uppercase">Clear Skies for 2 AM Wandering</p>
                    <p className="font-mono text-[10px] opacity-60">Visibility: Perfect for composing shayari that rhymes 'stability' with 'agility'.</p>
                  </div>
                </div>
              </div>

              {/* Letters to the Editor */}
              <div>
                <h3 className="font-serif font-black uppercase text-xl mb-4 border-b border-ink pb-2">Letters</h3>
                <div className="space-y-4">
                  <div className="border-b border-ink/10 pb-2">
                    <p className="text-[10px] italic leading-snug">"Sir, I must protest. Aditya's phone has been glowing during every movie we've watched since 2018. Is this legal?"</p>
                    <p className="text-[8px] font-mono uppercase mt-1 opacity-60">— A Blinded Friend</p>
                  </div>
                  <div className="border-b border-ink/10 pb-2">
                    <p className="text-[10px] italic leading-snug">"Regarding the 'Late Night Walks': I saw him at 3 AM talking to a cat about the Indian middle order. Please advise."</p>
                    <p className="text-[8px] font-mono uppercase mt-1 opacity-60">— Concerned Neighbor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fun & Games Section */}
        <section className="mb-12 border-b-4 border-ink pb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-ink flex-grow" />
            <h2 className="text-4xl font-serif font-black uppercase tracking-tighter halftone">Fun & Games</h2>
            <div className="h-px bg-ink flex-grow" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bingo */}
            <div className="lg:col-span-1">
              <div className="border-2 border-ink p-6 bg-paper relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 bg-ink text-paper px-3 py-1 text-[10px] font-mono uppercase tracking-widest">Interactive</div>
                <h3 className="font-serif font-black uppercase text-2xl mb-6 text-center border-b-2 border-ink pb-2">Aditya Bingo</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {bingoItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => toggleBingo(i)}
                      className={`aspect-square border border-ink/40 p-3 flex flex-col items-center justify-center text-center transition-all relative group ${
                        checkedBingo[i] ? 'bg-ink/5' : 'bg-white hover:bg-ink/5'
                      }`}
                    >
                      <span className={`text-[10px] leading-tight font-serif italic ${checkedBingo[i] ? 'opacity-40' : 'opacity-100'}`}>
                        {item}
                      </span>
                      {checkedBingo[i] && (
                        <motion.div 
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <Check className="w-12 h-12 text-ink/20 stroke-[3]" />
                          <div className="absolute inset-0 border-2 border-ink/20 m-1 rounded-sm" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-4 border border-ink/20 bg-ink/5 mb-8">
                  <p className="text-xs font-mono uppercase mb-2">Submit your score:</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="flex-grow bg-white border border-ink px-3 py-1 text-xs font-mono focus:outline-none"
                    />
                    <button 
                      onClick={submitScore}
                      disabled={isSubmitting}
                      className="bg-ink text-paper px-4 py-1 text-xs font-mono uppercase hover:bg-ink/80 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : 'Submit'}
                    </button>
                  </div>
                  <p className="text-[10px] font-mono mt-2 opacity-60 italic">Current Score: {checkedBingo.filter(Boolean).length}/9</p>
                </div>

                {/* Bingo Leaderboard */}
                <div className="mt-auto pt-6 border-t border-ink/10">
                  <h4 className="font-serif font-black uppercase text-xs mb-4 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Bingo Hall of Fame
                  </h4>
                  <div className="bg-white/50 rounded-lg p-3 border border-ink/5 min-h-[120px]">
                    {scores.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-ink/30 font-mono text-[9px] uppercase italic">
                        No scores yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {scores.map((s, idx) => (
                          <div key={s.id || idx} className="flex justify-between items-center font-mono text-[9px] uppercase border-b border-ink/5 pb-1 last:border-0">
                            <div className="flex items-center gap-2">
                              <span className="text-ink/30 w-3">{idx + 1}.</span>
                              <span className="font-bold truncate max-w-[100px]">{s.name}</span>
                            </div>
                            <span className="font-black text-ink/60">{s.score}/9</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[7px] font-mono uppercase mt-3 opacity-40 text-center tracking-tighter">Real-time updates enabled.</p>
                </div>
              </div>
            </div>

            {/* Crossword */}
            <div className="lg:col-span-1">
              <div className="border-2 border-ink p-6 bg-white h-full">
                <h3 className="font-serif font-black uppercase text-xl mb-6 text-center border-b border-ink pb-2">Daily Crossword</h3>
                <Crossword />
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <main>
          <VersionGallery />
        </main>

        {/* Footer / Classifieds */}
        <footer className="mt-24 pt-12 border-t-4 border-ink">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-[10px] uppercase tracking-widest opacity-60">
            <div className="space-y-4">
              <p className="font-black border-b border-ink/20 mb-2">Classifieds</p>
              <div>
                <p className="font-bold">WANTED: A HOBBY THAT ISN'T A SCREEN</p>
                <p>Seeking something that doesn't involve a refresh button or a 64-square grid. Serious inquiries only.</p>
              </div>
              <div>
                <p className="font-bold">FOR SALE: UNUSED GYM MEMBERSHIP</p>
                <p>Aditya is already fit from his 2 AM walks. No need for iron when you have moonlight and shayari.</p>
              </div>
              <div>
                <p className="font-bold">SERVICES: HEART READING</p>
                <p>Instant emotional diagnosis. Warning: May include unsolicited advice on your opening gambit.</p>
              </div>
              <div>
                <p className="font-bold">SPECIALTY: THE ADITYA TOUCH</p>
                <p>Is reportedly known for his massages among girls. :P Relax, it's just his EQ at work.</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-black border-b border-ink/20 mb-2">Announcements</p>
              <div>
                <p className="font-bold">SHAYARI SLAM OR CRY FOR HELP?</p>
                <p>Aditya to read verses tonight. Friends are bringing earplugs and tissues. Mostly earplugs.</p>
              </div>
              <div>
                <p className="font-bold">WEDDING ANCHOR SERVICES</p>
                <p>Available for your big day. Will manage the stage, the guests, and the Cricbuzz updates simultaneously.</p>
              </div>
              <div>
                <p className="font-bold">PUBLIC NOTICE</p>
                <p>Aditya's phone battery has requested a restraining order due to over-refreshing.</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-black border-b border-ink/20 mb-2">Global Sports Desk</p>
              <div>
                <p className="font-bold">OLYMPIC FEVER</p>
                <p>Aditya currently watching synchronized swimming, archery, and curling simultaneously. "It's about the spirit," he claims while ignoring his dinner.</p>
              </div>
              <div>
                <p className="font-bold">KABADDI KRONICLES</p>
                <p>Aditya has successfully predicted the winner of a local kabaddi tournament in a village he can't pronounce. "The raid was clinical," he noted to a confused waiter.</p>
              </div>
              <div>
                <p className="font-bold">NICHES & SCORES</p>
                <p>From Icelandic handball to Mongolian wrestling, if there's a score, Aditya is refreshing it. His data plan is in mourning.</p>
              </div>
              <div>
                <p className="font-bold">THE CHESS OBSESSION</p>
                <p>Local man plays blitz while brushing teeth. Dental health stable; ELO rating volatile. Has reportedly challenged a smart fridge to a match.</p>
              </div>
              <div className="pt-2 border-t border-ink/10">
                <p className="font-bold">LIVE SCOREBOARD</p>
                <div className="grid grid-cols-2 gap-1 text-[8px]">
                  <span>IND vs AUS (Cricket)</span><span className="text-right">ADITYA: 100% AWARE</span>
                  <span>NOR vs SWE (Curling)</span><span className="text-right">ADITYA: WATCHING</span>
                  <span>LOCAL CHESS BLITZ</span><span className="text-right">ADITYA: LOSING</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-black border-b border-ink/20 mb-2">Contact & Stats</p>
              <div>
                <p className="font-bold">CONSISTENCY TRACKER</p>
                <p>Aditya has worn the same blue, black, and white coloured clothes for 10,950 consecutive days. A true legend.</p>
              </div>
              <div>
                <p className="font-bold">HOTLINE</p>
                <p>1-800-ADITYA-30 (Press 1 for sports stats, Press 2 for emotional support, Press 3 for a wedding anchor booking).</p>
              </div>
              <div>
                <p className="font-bold">WEATHER REPORT</p>
                <p>100% chance of Aditya knowing exactly how you feel about this weather before you do.</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-12 pt-8 border-t border-ink/10">
            <p className="font-serif italic text-sm opacity-60">© 2026 The Birthday Gazette. All rights reserved. No part of this celebration may be reproduced without a toast.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
