import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelProgressBar from '@/components/PixelProgressBar';
import MarqueeStrip from '@/components/MarqueeStrip';
import GdgLogo from '@/components/GdgLogo';
import PixelRadar from '@/components/PixelRadar';
import { useGetActiveContestRound } from '@/hooks/contestHook';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [flashing, setFlashing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [adminRound, setAdminRound] = useState('1');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const { data: activeRound } = useGetActiveContestRound(true, 3000);

  const rules = [
    { num: '01', title: 'NO AI TOOLS ALLOWED', desc: 'Any use of AI assistants, chatbots, or code generation tools is strictly prohibited during all rounds.' },
    { num: '02', title: 'ACCURACY + SPEED = VICTORY', desc: 'Teams are ranked by correct matches first, then by time taken. Faster accurate submissions rank higher.' },
    { num: '03', title: 'NO SWITCHING AFTER SUBMIT', desc: 'Once the timer ends or you submit, all answers are locked. No changes permitted after submission.' },
    { num: '04', title: 'TEAM SIZE: 2 MEMBERS', desc: 'Each team must have exactly 2 members. Solo entries or teams larger than 2 will not be permitted to participate.' },
    { num: '05', title: 'FOLLOW ORGANIZER INSTRUCTIONS', desc: 'All decisions made by event organizers are final. Disputes will be resolved by the coordinators.' },
    { num: '06', title: 'NO INTER-TEAM COMMUNICATION', desc: 'Discussing answers or signaling other teams during a round is grounds for immediate disqualification.' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const stored = localStorage.getItem('cc_team');
  const team = stored ? JSON.parse(stored) : { teamName: 'UNNAMED', round: '1' };

  useEffect(() => {
    if (activeRound?._id && activeRound.status === 'LIVE') {
      const latestStored = localStorage.getItem('cc_team');
      const latestTeam = latestStored ? JSON.parse(latestStored) : team;

      localStorage.setItem(
        'cc_team',
        JSON.stringify({
          ...latestTeam,
          round: String(activeRound.roundNumber),
        }),
      );

      setFlashing(true);
      setTimeout(() => navigate(`/contest?roundId=${activeRound._id}`), 400);
    }
  }, [activeRound, navigate]);

  const handleSimulate = () => {
    setFlashing(true);
    setTimeout(() => navigate('/contest'), 400);
  };

  const handleLaunch = () => {
    setFlashing(true);
    setTimeout(() => navigate('/contest'), 400);
  };

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.6} />

      {/* Flash overlay */}
      {flashing && (
        <div className="fixed inset-0 z-50 bg-foreground animate-warp-flash pointer-events-none" />
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        {/* Breadcrumb / Title */}
        <div className="text-center mb-8">
          <h1 className="font-pixel text-2xl md:text-4xl text-primary neon-text-cyan mb-2">
            <span className="title-glitch-wrap">
              <span className="title-ghost">CODE CONUNDRUM</span>
              <span className="title-main">CODE CONUNDRUM</span>
            </span>
          </h1>
          <div className="font-pixel text-[8px] text-muted-foreground">MISSION CONTROL &gt; WAITING ROOM</div>
        </div>

        {/* Main Panel */}
        <div
          className="max-w-[640px] w-full text-center"
          style={{
            background: 'rgba(6, 6, 18, 0.92)',
            border: '2px solid hsl(var(--neon-cyan))',
            filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.2))',
            padding: '48px 40px',
            borderRadius: '0',
          }}
        >
          {/* GDG Logo */}
          <div className="flex flex-col items-center">
            <GdgLogo height={44} />
            <span className="font-pixel text-[8px] text-muted-foreground mt-2">GDGoC RNSIT</span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-muted my-5" />

          <h2
            className="font-pixel text-sm md:text-xl text-foreground mb-2"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }}
          >
            STANDBY FOR LAUNCH
          </h2>

          <p className="font-mono-tech text-[13px] text-muted-foreground/60 mb-6">
            Waiting for organizer to initiate Round {team.round}
            <span className="animate-blink-cursor">...</span>
          </p>

          <div className="mb-6">
            <div className="font-pixel text-[24px] text-accent neon-text-magenta mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="font-pixel text-[8px] text-muted-foreground animate-pulse">T-MINUS UNTIL LAUNCH</div>
          </div>

          {/* Team info badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-7">
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-primary text-primary">
              TEAM: {team.teamName.toUpperCase()}
            </span>
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-accent text-accent">
              ROUND: 0{team.round}
            </span>
            <span className="font-pixel text-[8px] px-[14px] py-2 bg-space-navy border-2 border-[#22C55E] text-[#22C55E]">
              STATUS: READY
            </span>
          </div>

          {/* Radar signal */}
          <div className="mb-8 w-[200px] h-[200px] mx-auto relative flex items-center justify-center">
            <PixelRadar />
          </div>

          {/* Actions */}
          <div className="mb-10 flex flex-col items-center gap-6 relative z-20">
            <button
              onClick={() => navigate('/home')}
              className="font-pixel text-[9px] text-muted-foreground px-6 py-2 transition-all border-2 border-muted-foreground/40 bg-space-navy hover:text-foreground hover:border-primary/50 cursor-pointer"
            >
              [ BACK TO HOME ]
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="font-pixel text-[9px] text-primary px-6 py-2 transition-all border-2 border-primary/50 bg-primary/10 hover:bg-primary/30 cursor-pointer"
            >
              [ LEADERBOARD ]
            </button>
            <div className="mt-2 text-center">
              <p className="font-mono-tech text-[10px] text-muted-foreground/40 tracking-[2px] mb-2">
                — FOR DEMO PURPOSES —
              </p>
              <button
                onClick={handleSimulate}
                className="font-pixel text-[9px] text-foreground px-6 py-3 transition-all hover:brightness-90 cursor-pointer"
                style={{
                  background: '#BE185D',
                  border: '2px solid #F472B6',
                  borderRadius: '0',
                  filter: 'drop-shadow(0 0 8px rgba(244,114,182,0.5))',
                }}
              >
                [ &gt;&gt; SIMULATE START ]
              </button>
            </div>
          </div>

          {/* Live participant count */}
          <PixelProgressBar value={12} max={20} variant="cyan" label="TEAMS READY" />
        </div>

        {/* Marquee at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <MarqueeStrip text="NO AI TOOLS ALLOWED * ACCURACY + SPEED = VICTORY * GOOD LUCK CADET * MATCH THE CODE * BEAT THE CLOCK *" />
        </div>
      </div>

      {/* Admin button */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-4 right-4 z-40 font-pixel text-[7px] bg-space-navy text-muted-foreground/50 px-[10px] py-[6px] transition-all hover:border-primary/50 hover:text-primary"
        style={{ border: '1px solid hsl(var(--muted))', borderRadius: '0' }}
      >
        [ADMIN]
      </button>

      {/* Rules button */}
      <button
        onClick={() => setShowRules(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 font-pixel text-[10px] bg-space-navy/80 text-primary px-3 py-6 transition-all border-l-2 border-y-2 border-primary hover:bg-primary/20 hover:pe-5"
        style={{ writingMode: 'vertical-lr', borderRadius: '8px 0 0 8px', backdropFilter: 'blur(4px)' }}
      >
        RULES
      </button>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-space-navy border-2 border-primary p-6 md:p-8 max-w-[800px] w-full relative max-h-[90vh] overflow-y-auto" style={{ borderRadius: 0 }}>
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 font-pixel text-[12px] text-muted-foreground hover:text-primary transition-colors"
            >
              [X]
            </button>
            <h3 className="font-pixel text-[14px] md:text-[18px] text-primary mb-8 text-center" style={{ filter: 'drop-shadow(0 0 8px #00F5FF)' }}>
              MISSION RULES
            </h3>

            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.num} className="bg-black/40 border-l-4 border-l-primary px-4 py-4 flex flex-col sm:flex-row sm:items-start gap-4 transition-all hover:bg-muted/10">
                  <div className="w-6 h-6 flex-shrink-0 border border-primary flex items-center justify-center">
                    <span className="font-pixel text-[8px] text-primary">{rule.num}</span>
                  </div>
                  <div>
                    <h4 className="font-pixel text-[10px] text-foreground mb-1">{rule.title}</h4>
                    <p className="font-mono-tech text-[11px] text-muted-foreground leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin modal */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-space-navy border-2 border-primary p-8 max-w-sm w-full mx-4 relative" style={{ borderRadius: 0 }}>
            <button
              onClick={() => setShowAdmin(false)}
              className="absolute top-2 right-3 font-pixel text-[10px] text-muted-foreground hover:text-foreground"
            >
              [X]
            </button>
            <h3 className="font-pixel text-[10px] text-primary mb-6 text-center">ADMIN PANEL</h3>
            <div className="mb-4">
              <span className="font-pixel text-[8px] text-muted-foreground">SET ROUND:</span>
              <div className="flex gap-2 mt-2">
                {['1', '2', '3'].map(r => (
                  <button
                    key={r}
                    onClick={() => setAdminRound(r)}
                    className={`font-pixel text-[9px] px-4 py-2 border-2 transition-all ${adminRound === r ? 'border-primary bg-primary/20 text-primary' : 'border-muted text-muted-foreground'}`}
                    style={{ borderRadius: 0 }}
                  >
                    [{r}]
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={handleLaunch}
                className="font-pixel text-[9px] text-foreground py-3 transition-all hover:brightness-90"
                style={{ background: '#16A34A', border: '2px solid #22C55E', borderRadius: 0, filter: 'drop-shadow(0 0 8px #22C55E)' }}
              >
                [ LAUNCH ROUND ]
              </button>
              <button
                className="font-pixel text-[9px] text-foreground bg-destructive border-2 border-destructive/60 py-3 hover:bg-destructive/80 transition-all"
                style={{ borderRadius: 0 }}
              >
                [ END ROUND ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;
