import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelBadge from '@/components/PixelBadge';
import PixelButton from '@/components/PixelButton';
import { cn } from '@/lib/utils';

const problems = [
  { id: 'Q1', text: 'What does this code output when input is 5?' },
  { id: 'Q2', text: 'Which snippet checks if a number is prime?' },
  { id: 'Q3', text: 'Which function reverses a string?' },
  { id: 'Q4', text: 'Which code finds the maximum in a list?' },
  { id: 'Q5', text: 'Which snippet implements bubble sort?' },
  { id: 'Q6', text: 'Which code counts vowels in a string?' },
  { id: 'Q7', text: 'Which function calculates factorial recursively?' },
  { id: 'Q8', text: 'Which snippet checks for palindrome?' },
];

const snippets = [
  { id: 'A', label: 'SNIPPET A', code: 'def fn(x):\n    return x * x + 2 * x + 1' },
  { id: 'B', label: 'SNIPPET B', code: 'def fn(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5)+1):\n        if n % i == 0: return False\n    return True' },
  { id: 'C', label: 'SNIPPET C', code: 'def fn(s):\n    return s[::-1]' },
  { id: 'D', label: 'SNIPPET D', code: 'def fn(lst):\n    return max(lst)' },
  { id: 'E', label: 'SNIPPET E', code: 'def fn(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr' },
  { id: 'F', label: 'SNIPPET F', code: 'def fn(s):\n    return sum(1 for c in s if c in \'aeiouAEIOU\')' },
  { id: 'G', label: 'SNIPPET G', code: 'def fn(n):\n    if n == 0: return 1\n    return n * fn(n-1)' },
  { id: 'H', label: 'SNIPPET H', code: 'def fn(s):\n    return s == s[::-1]' },
  { id: 'I', label: 'SNIPPET I (DECOY)', code: 'def fn(x, y):\n    return x ** y - y ** x' },
];

const correctAnswers: Record<string, string> = {
  Q1: 'A', Q2: 'B', Q3: 'C', Q4: 'D', Q5: 'E', Q6: 'F', Q7: 'G', Q8: 'H',
};

const Contest = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'snippets'>('problems');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const stored = localStorage.getItem('cc_team');
  const team = stored ? JSON.parse(stored) : { teamName: 'TEAM', round: '1' };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !locked) {
      handleSubmit();
    }
  }, [timeLeft, locked]);

  const assignedSnippets = new Set(Object.values(assignments));
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / 600) * 100;
  const timerColor = percentage > 50 ? '#22C55E' : percentage > 25 ? '#EAB308' : '#EF4444';

  const handleDragStart = (snippetId: string) => {
    if (locked) return;
    setDragging(snippetId);
  };

  const handleDrop = useCallback((problemId: string) => {
    if (locked) return;
    if (dragging) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(k => {
        if (newAssignments[k] === dragging) delete newAssignments[k];
      });
      newAssignments[problemId] = dragging;
      setAssignments(newAssignments);
      setDragging(null);
    }
  }, [dragging, assignments, locked]);

  const handleTapAssign = (problemId: string) => {
    if (locked) return;
    if (selectedSnippet) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(k => {
        if (newAssignments[k] === selectedSnippet) delete newAssignments[k];
      });
      newAssignments[problemId] = selectedSnippet;
      setAssignments(newAssignments);
      setSelectedSnippet(null);
    }
  };

  const removeAssignment = (problemId: string) => {
    if (locked) return;
    const newAssignments = { ...assignments };
    delete newAssignments[problemId];
    setAssignments(newAssignments);
  };

  const getSnippet = (id: string) => snippets.find(s => s.id === id);
  const matchedCount = Object.keys(assignments).length;

  const handleSubmit = () => {
    setLocked(true);
    clearInterval(timerRef.current);
    let score = 0;
    Object.entries(assignments).forEach(([q, s]) => {
      if (correctAnswers[q] === s) score++;
    });
    const timeTaken = 600 - timeLeft;
    localStorage.setItem('cc_result', JSON.stringify({ score, total: 8, timeTaken }));
    navigate('/round-complete');
  };

  const highlightCode = (code: string) => {
    return code.split('\n').map((line, i) => {
      let highlighted = line
        .replace(/(def |return |if |for |in |while |import |from |class |else |elif |and |or |not |True|False|None)/g, '<span style="color:#00F5FF">$1</span>')
        .replace(/(\'[^\']*\'|\"[^\"]*\")/g, '<span style="color:#F472B6">$1</span>')
        .replace(/(#.*)/g, '<span style="color:#6B7280">$1</span>');
      return <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />;
    });
  };

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets={false} opacity={0.2} />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-space-navy/95 border-b-2 border-primary/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelBadge variant="cyan">ROUND 0{team.round}</PixelBadge>
            <span className="hidden sm:inline font-pixel text-[8px] text-muted-foreground">{team.teamName.toUpperCase()}</span>
          </div>
          <div
            className="font-pixel text-xl md:text-2xl tracking-widest"
            style={{ color: timerColor, filter: `drop-shadow(0 0 8px ${timerColor})` }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[8px] text-muted-foreground">
              MATCHED: {matchedCount}/8
            </span>
            <button
              onClick={handleSubmit}
              disabled={locked}
              className="font-pixel text-[8px] bg-secondary text-secondary-foreground px-3 py-1.5 border-2 border-secondary/60 hover:bg-secondary/80 disabled:opacity-50 transition-all"
            >
              [ SUBMIT ]
            </button>
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden fixed top-[44px] left-0 right-0 z-30 bg-space-navy/95 flex border-b-2 border-primary/20">
        <button
          className={cn(
            'flex-1 font-pixel text-[9px] py-2 transition-all',
            activeTab === 'problems' ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground'
          )}
          onClick={() => setActiveTab('problems')}
        >
          PROBLEMS
        </button>
        <button
          className={cn(
            'flex-1 font-pixel text-[9px] py-2 transition-all',
            activeTab === 'snippets' ? 'bg-accent/20 text-accent' : 'text-muted-foreground'
          )}
          onClick={() => setActiveTab('snippets')}
        >
          SNIPPETS
        </button>
      </div>

      {/* Main split area */}
      <div className="relative z-10 pt-[44px] md:pt-[44px] min-h-screen flex">
        {/* LEFT: Problems */}
        <div
          className={cn(
            'w-full md:w-1/2 overflow-y-auto p-4 space-y-4',
            activeTab !== 'problems' && 'hidden md:block'
          )}
          style={{ paddingTop: '1rem', maxHeight: 'calc(100vh - 44px)' }}
        >
          <div className="font-pixel text-[10px] text-secondary border-b-2 border-secondary/30 pb-2 mb-4">
            [ MISSION OBJECTIVES ]
          </div>
          {problems.map((p) => (
            <div
              key={p.id}
              className="bg-space-navy border border-muted-foreground/10 p-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(p.id)}
              onClick={() => handleTapAssign(p.id)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 flex-shrink-0 border-2 border-primary flex items-center justify-center">
                  <span className="font-pixel text-[8px] text-primary">{p.id}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono-tech leading-relaxed">{p.text}</span>
              </div>

              {/* Drop Zone */}
              {assignments[p.id] ? (
                <div className="relative border-2 border-primary bg-space-navy/50 p-3" style={{ filter: 'drop-shadow(0 0 4px #00F5FF)' }}>
                  {!locked && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeAssignment(p.id); }}
                      className="absolute top-1 right-1 font-pixel text-[8px] text-destructive hover:text-destructive/80"
                    >
                      [X]
                    </button>
                  )}
                  <PixelBadge variant="cyan" className="mb-2">{getSnippet(assignments[p.id])?.label}</PixelBadge>
                  <pre className="text-[10px] text-muted-foreground font-mono-tech whitespace-pre-wrap">
                    {highlightCode(getSnippet(assignments[p.id])?.code || '')}
                  </pre>
                </div>
              ) : (
                <div className={cn(
                  'border-2 border-dashed border-muted-foreground/20 min-h-[48px] flex items-center justify-center transition-all',
                  dragging && 'border-primary border-solid animate-pulse-glow',
                  selectedSnippet && 'border-primary/60 bg-primary/5'
                )}>
                  <span className="font-mono-tech text-[10px] text-muted-foreground/40">
                    {selectedSnippet ? '[ TAP TO ASSIGN ]' : '[ DROP CODE HERE ]'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider (desktop) */}
        <div className="hidden md:block w-[2px] bg-primary/50" style={{ filter: 'drop-shadow(0 0 4px #00F5FF)' }} />

        {/* RIGHT: Code Snippets */}
        <div
          className={cn(
            'w-full md:w-1/2 overflow-y-auto p-4 space-y-3',
            activeTab !== 'snippets' && 'hidden md:block'
          )}
          style={{ paddingTop: '1rem', maxHeight: 'calc(100vh - 44px)' }}
        >
          <div className="font-pixel text-[10px] text-accent border-b-2 border-accent/30 pb-2 mb-4">
            [ CODE ARSENAL ]
          </div>
          {snippets.map((s) => {
            const deployed = assignedSnippets.has(s.id);
            const selected = selectedSnippet === s.id;
            return (
              <div
                key={s.id}
                draggable={!deployed && !locked}
                onDragStart={() => handleDragStart(s.id)}
                onDragEnd={() => setDragging(null)}
                onClick={() => !deployed && !locked && setSelectedSnippet(selected ? null : s.id)}
                className={cn(
                  'bg-[#060612] p-3 border-2 border-accent/40 cursor-grab transition-all',
                  deployed && 'opacity-40 cursor-default',
                  selected && 'border-primary',
                  !deployed && !locked && 'hover:border-accent hover:scale-[1.01]'
                )}
                style={selected ? { filter: 'drop-shadow(0 0 6px #00F5FF)' } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <PixelBadge variant={deployed ? 'red' : selected ? 'cyan' : 'violet'}>
                    {s.label}
                  </PixelBadge>
                  {deployed && (
                    <span className="font-pixel text-[7px] text-muted-foreground">DEPLOYED</span>
                  )}
                  {selected && (
                    <span className="font-pixel text-[7px] text-primary animate-blink-cursor">SELECTED</span>
                  )}
                </div>
                <pre className="text-[11px] font-mono-tech whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {highlightCode(s.code)}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Contest;
