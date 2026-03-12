import { useMemo, useState } from "react";
import { useGetRoundLeaderboard } from "@/hooks/contestHook";

const roundTabs = [
  { label: "ROUND 1", roundNumber: 1 },
  { label: "ROUND 2", roundNumber: 2 },
  { label: "ROUND 3", roundNumber: 3 },
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export default function LeaderboardPanel() {
  const [activeRound, setActiveRound] = useState(0);
  const roundNumber = roundTabs[activeRound]?.roundNumber ?? 1;

  const { data = [], isLoading } = useGetRoundLeaderboard(roundNumber);

  const rows = useMemo(
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

  return (
    <section className="admin-placeholder-panel">
      <div className="admin-kicker">Live Data</div>
      <h2 className="panel-title">
        <span className="text-2xl">🏆</span>
        Round Leaderboard
      </h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {roundTabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveRound(index)}
            className={`border px-3 py-2 text-xs tracking-[0.18em] ${
              activeRound === index
                ? "border-cyan-300 bg-cyan-400/20 text-cyan-100"
                : "border-cyan-600/50 bg-slate-950/40 text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border border-cyan-500/20 bg-slate-950/35 text-sm">
          <thead>
            <tr className="border-b border-cyan-500/20 text-left text-xs uppercase tracking-[0.22em] text-cyan-300">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.rank}-${row.team}`} className="border-b border-cyan-500/10 text-slate-200">
                <td className="px-4 py-3 font-semibold text-cyan-200">#{row.rank}</td>
                <td className="px-4 py-3">{row.team}</td>
                <td className="px-4 py-3">{row.score}</td>
                <td className="px-4 py-3">{row.time}</td>
                <td className="px-4 py-3">{row.accuracy}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No submissions yet for this round.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
