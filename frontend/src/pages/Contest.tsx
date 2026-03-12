import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StarfieldBackground from "@/components/StarfieldBackground";
import PixelBadge from "@/components/PixelBadge";
import { cn } from "@/lib/utils";
import { useGetActiveContestRound, useGetContestData, useSubmitContest } from "@/hooks/contestHook";
import { useToast } from "@/hooks/use-toast";

const shuffle = <T,>(input: T[]): T[] => {
  const array = [...input];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
};

const Contest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"problems" | "snippets">("problems");
  const [locked, setLocked] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [clockTick, setClockTick] = useState(0);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);

  const autoSubmitRef = useRef(false);

  const roundIdFromUrl = new URLSearchParams(location.search).get("roundId") || undefined;

  const { data: activeRound } = useGetActiveContestRound(true, 1000);
  const activeRoundId = roundIdFromUrl || activeRound?._id;

  const { data: contestData, isLoading, isError, error: contestError } = useGetContestData(activeRoundId);
  const submitContest = useSubmitContest();

  const round = contestData?.round;
  const liveRound = useMemo(() => {
    if (activeRound && (!activeRoundId || activeRound._id === activeRoundId)) {
      return activeRound;
    }
    return round;
  }, [activeRound, activeRoundId, round]);

  const problems = useMemo(
    () => {
      const randomizedQuestions = shuffle(contestData?.questions ?? []);

      return randomizedQuestions.map((question, index) => ({
        id: question._id,
        label: `Q${index + 1}`,
        text: question.question,
      }));
    },
    [contestData?.questions, activeRoundId]
  );

  const snippets = useMemo(
    () => {
      const randomizedAnswers = shuffle(contestData?.answers ?? []);

      return randomizedAnswers.map((answer, index) => ({
        id: answer._id,
        label: `SNIPPET ${String.fromCharCode(65 + (index % 26))}`,
        code: answer.code,
      }));
    },
    [contestData?.answers, activeRoundId]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setClockTick((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!liveRound?.serverNow) {
      return;
    }

    const backendNow = new Date(liveRound.serverNow).getTime();
    if (!Number.isNaN(backendNow)) {
      setServerOffsetMs(Date.now() - backendNow);
    }
  }, [liveRound?.serverNow]);

  const assignedSnippets = useMemo(() => new Set(Object.values(assignments)), [assignments]);
  const matchedCount = Object.keys(assignments).length;

  const totalDuration = liveRound?.duration || 1;
  const effectiveNow = useMemo(() => Date.now() - serverOffsetMs, [clockTick, serverOffsetMs]);
  const timeLeft = useMemo(() => {
    if (!liveRound) {
      return 0;
    }

    if (liveRound.endTime) {
      const endMs = new Date(liveRound.endTime).getTime();
      const referenceMs = liveRound.isPaused && liveRound.pauseStartAt
        ? new Date(liveRound.pauseStartAt).getTime()
        : effectiveNow;

      return Math.max(0, Math.floor((endMs - referenceMs) / 1000));
    }

    if (liveRound.startTime) {
      const startMs = new Date(liveRound.startTime).getTime();
      const elapsed = Math.floor((effectiveNow - startMs) / 1000);
      return Math.max(0, liveRound.duration - elapsed);
    }

    return Math.max(0, liveRound.duration ?? 0);
  }, [effectiveNow, liveRound]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / totalDuration) * 100;
  const timerColor = percentage > 50 ? "#22C55E" : percentage > 25 ? "#EAB308" : "#EF4444";

  const handleDragStart = (snippetId: string) => {
    if (locked) return;
    setDragging(snippetId);
  };

  const handleDrop = useCallback(
    (problemId: string) => {
      if (locked || !dragging) return;

      const nextAssignments = { ...assignments };
      Object.keys(nextAssignments).forEach((key) => {
        if (nextAssignments[key] === dragging) {
          delete nextAssignments[key];
        }
      });

      nextAssignments[problemId] = dragging;
      setAssignments(nextAssignments);
      setDragging(null);
    },
    [assignments, dragging, locked]
  );

  const handleTapAssign = (problemId: string) => {
    if (locked || !selectedSnippet) return;

    const nextAssignments = { ...assignments };
    Object.keys(nextAssignments).forEach((key) => {
      if (nextAssignments[key] === selectedSnippet) {
        delete nextAssignments[key];
      }
    });

    nextAssignments[problemId] = selectedSnippet;
    setAssignments(nextAssignments);
    setSelectedSnippet(null);
  };

  const removeAssignment = (problemId: string) => {
    if (locked) return;
    const nextAssignments = { ...assignments };
    delete nextAssignments[problemId];
    setAssignments(nextAssignments);
  };

  const getSnippet = (id: string) => snippets.find((item) => item.id === id);

  const handleSubmit = useCallback(async () => {
    if (locked || !activeRoundId || !liveRound) return;

    setLocked(true);
    setSubmitError("");

    const payloadAnswers = Object.entries(assignments).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));

    const timeTaken = Math.max(0, liveRound.duration - timeLeft);

    try {
      const result = await submitContest.mutateAsync({
        roundId: activeRoundId,
        answers: payloadAnswers,
        timeTaken,
      });

      localStorage.setItem(
        "cc_result",
        JSON.stringify({
          score: result.score,
          total: result.totalQuestions,
          timeTaken,
          accuracy: result.accuracy,
        })
      );

      toast({
        title: "Submission successful",
        description: "Redirecting to leaderboard...",
      });

      setTimeout(() => {
        navigate("/leaderboard");
      }, 900);
    } catch (error: unknown) {
      const responseStatus =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response?.status === "number"
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      const responseCode =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { code?: string } } }).response?.data?.code === "string"
          ? (error as { response?: { data?: { code?: string } } }).response?.data?.code
          : undefined;

      if (responseStatus === 409 && responseCode === "ALREADY_SUBMITTED") {
        toast({
          title: "Round already submitted",
          description: "Redirecting to leaderboard...",
        });
        navigate("/leaderboard", { replace: true });
        return;
      }

      const responseMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      const message = responseMessage || (error instanceof Error ? error.message : "Submission failed. Please try again.");
      setSubmitError(message);
      setLocked(false);
    }
  }, [activeRoundId, assignments, liveRound, locked, navigate, submitContest, timeLeft, toast]);

  useEffect(() => {
    autoSubmitRef.current = false;
  }, [activeRoundId]);

  useEffect(() => {
    if (!isError || !contestError) {
      return;
    }

    const statusCode =
      typeof contestError === "object" &&
      contestError !== null &&
      "response" in contestError &&
      typeof (contestError as { response?: { status?: number } }).response?.status === "number"
        ? (contestError as { response?: { status?: number } }).response?.status
        : undefined;

    const errorCode =
      typeof contestError === "object" &&
      contestError !== null &&
      "response" in contestError &&
      typeof (contestError as { response?: { data?: { code?: string } } }).response?.data?.code === "string"
        ? (contestError as { response?: { data?: { code?: string } } }).response?.data?.code
        : undefined;

    if (statusCode === 403 && errorCode === "ALREADY_SUBMITTED") {
      toast({
        title: "Round already submitted",
        description: "You cannot re-enter this contest. Redirecting to leaderboard...",
      });
      navigate("/leaderboard", { replace: true });
    }
  }, [contestError, isError, navigate, toast]);

  useEffect(() => {
    if (!liveRound || autoSubmitRef.current) {
      return;
    }

    if (timeLeft === 0 && !locked) {
      autoSubmitRef.current = true;
      void handleSubmit();
    }
  }, [handleSubmit, liveRound, locked, timeLeft]);

  const highlightCode = (code: string) => {
    return code.split("\n").map((line, index) => {
      const highlighted = line
        .replace(
          /(def |return |if |for |in |while |import |from |class |else |elif |and |or |not |True|False|None)/g,
          '<span style="color:#00F5FF">$1</span>'
        )
        .replace(/('[^']*'|"[^"]*")/g, '<span style="color:#F472B6">$1</span>')
        .replace(/(#.*)/g, '<span style="color:#6B7280">$1</span>');

      return <div key={index} dangerouslySetInnerHTML={{ __html: highlighted }} />;
    });
  };

  if (isLoading || !liveRound) {
    return (
      <div className="relative min-h-screen scanline-overlay">
        <StarfieldBackground showClouds={false} showPlanets={false} opacity={0.2} />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="font-pixel text-[10px] text-primary">LOADING ROUND DATA...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets={false} opacity={0.2} />

      <div className="fixed left-0 right-0 top-0 z-40 border-b-2 border-primary/20 bg-space-navy/95 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelBadge variant="cyan">ROUND 0{liveRound.roundNumber}</PixelBadge>
          </div>
          <div className="font-pixel text-xl tracking-widest md:text-2xl" style={{ color: timerColor, filter: `drop-shadow(0 0 8px ${timerColor})` }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[8px] text-muted-foreground">MATCHED: {matchedCount}/{problems.length}</span>
            <button
              onClick={() => void handleSubmit()}
              disabled={locked || submitContest.isPending}
              className="border-2 border-secondary/60 bg-secondary px-3 py-1.5 font-pixel text-[8px] text-secondary-foreground transition-all hover:bg-secondary/80 disabled:opacity-50"
            >
              [ SUBMIT ]
            </button>
          </div>
        </div>
        {submitError && (
          <div className="mx-auto mt-2 max-w-7xl font-pixel text-[8px] text-destructive">{submitError}</div>
        )}
      </div>

      <div className="fixed left-0 right-0 top-[44px] z-30 flex border-b-2 border-primary/20 bg-space-navy/95 md:hidden">
        <button
          className={cn(
            "flex-1 py-2 font-pixel text-[9px] transition-all",
            activeTab === "problems" ? "bg-secondary/20 text-secondary" : "text-muted-foreground"
          )}
          onClick={() => setActiveTab("problems")}
        >
          PROBLEMS
        </button>
        <button
          className={cn(
            "flex-1 py-2 font-pixel text-[9px] transition-all",
            activeTab === "snippets" ? "bg-accent/20 text-accent" : "text-muted-foreground"
          )}
          onClick={() => setActiveTab("snippets")}
        >
          SNIPPETS
        </button>
      </div>

      <div className="relative z-10 flex min-h-screen pt-[44px] md:pt-[44px]">
        <div
          className={cn("w-full space-y-4 overflow-y-auto p-4 md:w-1/2", activeTab !== "problems" && "hidden md:block")}
          style={{ paddingTop: "1rem", maxHeight: "calc(100vh - 44px)" }}
        >
          <div className="mb-4 border-b-2 border-secondary/30 pb-2 font-pixel text-[10px] text-secondary">[ MISSION OBJECTIVES ]</div>
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="border border-muted-foreground/10 bg-space-navy p-4"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(problem.id)}
              onClick={() => handleTapAssign(problem.id)}
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-2 border-primary">
                  <span className="font-pixel text-[8px] text-primary">{problem.label}</span>
                </div>
                <span className="font-mono-tech text-xs leading-relaxed text-muted-foreground">{problem.text}</span>
              </div>

              {assignments[problem.id] ? (
                <div className="relative border-2 border-primary bg-space-navy/50 p-3" style={{ filter: "drop-shadow(0 0 4px #00F5FF)" }}>
                  {!locked && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        removeAssignment(problem.id);
                      }}
                      className="absolute right-1 top-1 font-pixel text-[8px] text-destructive hover:text-destructive/80"
                    >
                      [X]
                    </button>
                  )}
                  <PixelBadge variant="cyan" className="mb-2">
                    {getSnippet(assignments[problem.id])?.label}
                  </PixelBadge>
                  <pre className="whitespace-pre-wrap font-mono-tech text-[10px] text-muted-foreground">
                    {highlightCode(getSnippet(assignments[problem.id])?.code || "")}
                  </pre>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex min-h-[48px] items-center justify-center border-2 border-dashed border-muted-foreground/20 transition-all",
                    dragging && "animate-pulse-glow border-solid border-primary",
                    selectedSnippet && "border-primary/60 bg-primary/5"
                  )}
                >
                  <span className="font-mono-tech text-[10px] text-muted-foreground/40">
                    {selectedSnippet ? "[ TAP TO ASSIGN ]" : "[ DROP CODE HERE ]"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden w-[2px] bg-primary/50 md:block" style={{ filter: "drop-shadow(0 0 4px #00F5FF)" }} />

        <div
          className={cn("w-full space-y-3 overflow-y-auto p-4 md:w-1/2", activeTab !== "snippets" && "hidden md:block")}
          style={{ paddingTop: "1rem", maxHeight: "calc(100vh - 44px)" }}
        >
          <div className="mb-4 border-b-2 border-accent/30 pb-2 font-pixel text-[10px] text-accent">[ CODE ARSENAL ]</div>
          {snippets.map((snippet) => {
            const deployed = assignedSnippets.has(snippet.id);
            const selected = selectedSnippet === snippet.id;

            return (
              <div
                key={snippet.id}
                draggable={!deployed && !locked}
                onDragStart={() => handleDragStart(snippet.id)}
                onDragEnd={() => setDragging(null)}
                onClick={() => !deployed && !locked && setSelectedSnippet(selected ? null : snippet.id)}
                className={cn(
                  "cursor-grab border-2 border-accent/40 bg-[#060612] p-3 transition-all",
                  deployed && "cursor-default opacity-40",
                  selected && "border-primary",
                  !deployed && !locked && "hover:scale-[1.01] hover:border-accent"
                )}
                style={selected ? { filter: "drop-shadow(0 0 6px #00F5FF)" } : undefined}
              >
                <div className="mb-2 flex items-center justify-between">
                  <PixelBadge variant={deployed ? "red" : selected ? "cyan" : "violet"}>{snippet.label}</PixelBadge>
                  {deployed && <span className="font-pixel text-[7px] text-muted-foreground">DEPLOYED</span>}
                  {selected && <span className="animate-blink-cursor font-pixel text-[7px] text-primary">SELECTED</span>}
                </div>
                <pre className="whitespace-pre-wrap font-mono-tech text-[11px] leading-relaxed text-muted-foreground">{highlightCode(snippet.code)}</pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Contest;
