import { useState } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelCard from '@/components/PixelCard';
import PixelBadge from '@/components/PixelBadge';
import { CrownIcon, MedalIcon } from '@/components/PixelIcons';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const roundTabs = ['ROUND 1', 'ROUND 2', 'ROUND 3', 'FINAL'];

const leaderboardData = [
  { rank: 1, team: 'PIXEL PIRATES', score: 780, time: '12:34', accuracy: '97%' },
  { rank: 2, team: 'BYTE BUSTERS', score: 740, time: '13:02', accuracy: '92%' },
  { rank: 3, team: 'CODE CADETS', score: 710, time: '14:15', accuracy: '89%' },
  { rank: 4, team: 'SYNTAX SQUAD', score: 680, time: '14:45', accuracy: '85%' },
  { rank: 5, team: 'ALGO ASTRONAUTS', score: 650, time: '15:20', accuracy: '81%' },
  { rank: 6, team: 'BUG HUNTERS', score: 620, time: '16:01', accuracy: '78%' },
  { rank: 7, team: 'STACK OVERFLOW', score: 590, time: '16:30', accuracy: '74%' },
  { rank: 8, team: 'NULL POINTERS', score: 560, time: '17:10', accuracy: '71%' },
  { rank: 9, team: 'RECURSIVE REBELS', score: 530, time: '18:00', accuracy: '66%' },
  { rank: 10, team: 'BINARY BLAZERS', score: 500, time: '18:45', accuracy: '63%' },
];

const podiumConfig = {
  1: { glow: '#FFD700', text: 'text-rank-gold', height: 'h-32', border: 'border-rank-gold', bg: 'bg-rank-gold/10' },
  2: { glow: '#C0C0C0', text: 'text-rank-silver', height: 'h-24', border: 'border-rank-silver', bg: 'bg-rank-silver/10' },
  3: { glow: '#CD7F32', text: 'text-rank-bronze', height: 'h-20', border: 'border-rank-bronze', bg: 'bg-rank-bronze/10' },
};

const Leaderboard = () => {
  const [activeRound, setActiveRound] = useState(0);
  const top3 = leaderboardData.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.5} />

      <div className="relative z-10 pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="font-pixel text-2xl md:text-4xl text-primary neon-text-cyan mb-2">
              <span className="title-glitch-wrap">
                <span className="title-ghost">CODE CONUNDRUM</span>
                <span className="title-main">CODE CONUNDRUM</span>
              </span>
            </h1>
            <h2
              className="font-pixel text-sm md:text-lg text-rank-gold"
              style={{ filter: 'drop-shadow(0 0 10px #FFD700)' }}
            >
              GALACTIC LEADERBOARD
            </h2>
          </div>

          {/* Round tabs */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {roundTabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveRound(i)}
                className={cn(
                  'font-pixel text-[8px] px-3 py-2 border-2 transition-all',
                  activeRound === i
                    ? 'bg-secondary border-secondary text-secondary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-secondary/50'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-12">
            {podiumOrder.map((entry, idx) => {
              const pos = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const config = podiumConfig[pos as 1 | 2 | 3];
              return (
                <div key={entry.rank} className="flex flex-col items-center">
                  {pos === 1 && <CrownIcon size={28} className="mb-2" />}
                  {pos === 2 && <MedalIcon rank={2} size={24} className="mb-2" />}
                  {pos === 3 && <MedalIcon rank={3} size={24} className="mb-2" />}
                  <span className={cn('font-pixel text-[8px] mb-2', config.text)}>
                    {entry.team}
                  </span>
                  <span className="font-pixel text-[10px] text-foreground mb-2">{entry.score}</span>
                  <div
                    className={cn(
                      'w-20 md:w-28',
                      config.height,
                      config.border,
                      config.bg,
                      'border-4 flex items-center justify-center'
                    )}
                    style={{ filter: `drop-shadow(0 0 8px ${config.glow})` }}
                  >
                    <span className={cn('font-pixel text-lg', config.text)}>{pos}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <div className="w-2 h-2 bg-[#22C55E] animate-blink-cursor" />
            <span className="font-pixel text-[8px] text-[#22C55E]">LIVE</span>
          </div>

          {/* Rankings table */}
          <PixelCard variant="cyan" className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  {['RANK', 'TOP COMMANDERS', 'SCORE', 'TIME', 'ACCURACY'].map(h => (
                    <th key={h} className="font-pixel text-[8px] text-primary py-2 px-3 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, i) => (
                  <tr
                    key={entry.rank}
                    className={cn(
                      'border-b border-muted/30 transition-all',
                      i % 2 === 0 ? 'bg-space-navy/50' : 'bg-card',
                      entry.rank === 1 && 'border-l-4 border-l-primary bg-primary/5'
                    )}
                  >
                    <td className="py-2 px-3">
                      <div
                        className="w-7 h-7 border-2 border-muted-foreground/20 bg-space-navy flex items-center justify-center"
                        style={entry.rank <= 3 ? {
                          borderColor: entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32',
                          filter: `drop-shadow(0 0 4px ${entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'})`,
                        } : undefined}
                      >
                        <span className="font-pixel text-[8px] text-foreground">
                          {String(entry.rank).padStart(2, '0')}
                        </span>
                      </div>
                    </td>
                    <td className="font-pixel text-[8px] text-foreground py-2 px-3">
                      {entry.team}
                    </td>
                    <td className="font-mono-tech text-sm text-foreground py-2 px-3">
                      {entry.score}
                    </td>
                    <td className="font-mono-tech text-sm text-muted-foreground py-2 px-3">
                      {entry.time}
                    </td>
                    <td className="font-mono-tech text-sm text-primary py-2 px-3">
                      {entry.accuracy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PixelCard>

          {/* Bottom actions */}
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/waiting-room">
              <button className="font-pixel text-[8px] text-primary bg-transparent border-2 border-primary px-4 py-2 hover:bg-primary/10 transition-all">
                [ BACK TO WAITING ROOM ]
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
