import { useMemo, useState } from "react";
import StarfieldBackground from "@/components/StarfieldBackground";
import PixelCard from "@/components/PixelCard";
import { CrownIcon, MedalIcon } from "@/components/PixelIcons";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useGetRoundLeaderboard } from "@/hooks/contestHook";

const roundTabs = [
  { label: "ROUND 1", roundNumber: 1 },
  { label: "ROUND 2", roundNumber: 2 },
  { label: "ROUND 3", roundNumber: 3 },
  { label: "FINAL", roundNumber: 3 },
];

const podiumConfig = {
  1: { glow: "#FFD700", text: "text-rank-gold", height: "h-32", border: "border-rank-gold", bg: "bg-rank-gold/10" },
  2: { glow: "#C0C0C0", text: "text-rank-silver", height: "h-24", border: "border-rank-silver", bg: "bg-rank-silver/10" },
  3: { glow: "#CD7F32", text: "text-rank-bronze", height: "h-20", border: "border-rank-bronze", bg: "bg-rank-bronze/10" },
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const Leaderboard = () => {
  const [activeRound, setActiveRound] = useState(0);
  const roundNumber = roundTabs[activeRound]?.roundNumber ?? 1;

  const { data = [], isLoading } = useGetRoundLeaderboard(roundNumber);

  const leaderboardData = useMemo(
    () =>
      data.map((entry) => ({
        rank: entry.rank,
        team: entry.teamName,
        score: entry.score,
        time: formatTime(entry.timeSeconds),
        accuracy: `${entry.accuracy}%`,
      })),
    [data]
  );

  const top3 = leaderboardData.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.5} />

      <div className="relative z-10 px-4 pb-12 pt-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <h1 className="title-glitch-wrap mb-2 font-pixel text-2xl text-primary neon-text-cyan md:text-4xl">
              <span className="title-ghost">CODE CONUNDRUM</span>
              <span className="title-main">CODE CONUNDRUM</span>
            </h1>
            <h2 className="font-pixel text-sm text-rank-gold md:text-lg" style={{ filter: "drop-shadow(0 0 10px #FFD700)" }}>
              GALACTIC LEADERBOARD
            </h2>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {roundTabs.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActiveRound(index)}
                className={cn(
                  "border-2 px-3 py-2 font-pixel text-[8px] transition-all",
                  activeRound === index
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground hover:border-secondary/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!isLoading && leaderboardData.length >= 3 && (
            <div className="mb-12 flex items-end justify-center gap-4">
              {podiumOrder.map((entry, idx) => {
                const pos = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const config = podiumConfig[pos as 1 | 2 | 3];
                return (
                  <div key={entry.rank} className="flex flex-col items-center">
                    {pos === 1 && <CrownIcon size={28} className="mb-2" />}
                    {pos === 2 && <MedalIcon rank={2} size={24} className="mb-2" />}
                    {pos === 3 && <MedalIcon rank={3} size={24} className="mb-2" />}
                    <span className={cn("mb-2 font-pixel text-[8px]", config.text)}>{entry.team}</span>
                    <span className="mb-2 font-pixel text-[10px] text-foreground">{entry.score}</span>
                    <div className={cn("flex w-20 items-center justify-center border-4 md:w-28", config.height, config.border, config.bg)} style={{ filter: `drop-shadow(0 0 8px ${config.glow})` }}>
                      <span className={cn("font-pixel text-lg", config.text)}>{pos}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mb-3 flex items-center justify-end gap-2">
            <div className="h-2 w-2 bg-[#22C55E] animate-blink-cursor" />
            <span className="font-pixel text-[8px] text-[#22C55E]">LIVE</span>
          </div>

          <PixelCard variant="cyan" className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  {["RANK", "TOP COMMANDERS", "SCORE", "TIME", "ACCURACY"].map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-pixel text-[8px] text-primary">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry, index) => (
                  <tr
                    key={entry.rank}
                    className={cn(
                      "border-b border-muted/30 transition-all",
                      index % 2 === 0 ? "bg-space-navy/50" : "bg-card",
                      entry.rank === 1 && "border-l-4 border-l-primary bg-primary/5"
                    )}
                  >
                    <td className="px-3 py-2">
                      <div className="flex h-7 w-7 items-center justify-center border-2 border-muted-foreground/20 bg-space-navy">
                        <span className="font-pixel text-[8px] text-foreground">{String(entry.rank).padStart(2, "0")}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-pixel text-[8px] text-foreground">{entry.team}</td>
                    <td className="px-3 py-2 font-mono-tech text-sm text-foreground">{entry.score}</td>
                    <td className="px-3 py-2 font-mono-tech text-sm text-muted-foreground">{entry.time}</td>
                    <td className="px-3 py-2 font-mono-tech text-sm text-primary">{entry.accuracy}</td>
                  </tr>
                ))}
                {!isLoading && leaderboardData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center font-mono-tech text-sm text-muted-foreground">
                      No submissions yet for this round.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </PixelCard>

          <div className="mt-8 flex justify-center gap-4">
            <Link to="/waiting-room">
              <button className="border-2 border-primary bg-transparent px-4 py-2 font-pixel text-[8px] text-primary transition-all hover:bg-primary/10">
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
