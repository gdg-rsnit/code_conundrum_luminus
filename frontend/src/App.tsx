import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as HotToaster } from "react-hot-toast";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useGetActiveContestRound } from "./hooks/contestHook";
import UserHomePage from "./pages/UserHomePage";
import Header from "./components/admin/Header";
import Sidebar from "./components/admin/Sidebar";
import Footer from "./components/admin/Footer";
import Navbar from "./components/Navbar";
import RoundPanel from "./components/admin/RoundPanel";
import QuestionsPanel from "./components/admin/QuestionsPanel";
import TeamsPanel from "./components/admin/TeamsPanel";
import UsersPanel from "./components/admin/UsersPanel";
import LeaderboardPanel from "./components/admin/LeaderboardPanel.tsx";
import Index from "./pages/Index";
import Intro from "./pages/Intro";
import WaitingRoom from "./pages/WaitingRoom";
import Contest from "./pages/Contest";
import Leaderboard from "./pages/Leaderboard";
import Rules from "./pages/Rules";
import Register from "./pages/Register";
import RoundComplete from "./pages/RoundComplete";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type PlaceholderPanelProps = {
  icon: string;
  title: string;
  subtitle: string;
};

function PlaceholderPanel({ icon, title, subtitle }: PlaceholderPanelProps) {
  return (
    <div className="admin-placeholder-panel">
      <div className="admin-kicker">Module Pending</div>
      <h2 className="panel-title">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      <div className="py-12 text-center">
        <p className="admin-placeholder-icon">{icon}</p>
        <p className="mx-auto mb-2 max-w-xl text-sm text-slate-300/85 md:text-base">{subtitle}</p>
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/55">Attach live data when ready</p>
      </div>
    </div>
  );
}

function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const pageMeta: Record<string, { icon: string; title: string }> = {
    "/admin/rounds": { icon: "🔄", title: "Round Management" },
    "/admin/questions": { icon: "📝", title: "Questions & Answers" },
    "/admin/teams": { icon: "👥", title: "Team Management" },
    "/admin/users": { icon: "👤", title: "User Management" },
    "/admin/leaderboard": { icon: "🏆", title: "Leaderboard" },
    "/admin/monitoring": { icon: "📊", title: "Monitoring" },
  };

  const currentMeta = pageMeta[location.pathname] || { icon: "🧩", title: "Admin" };

  return (
    <div className="admin-shell grid min-h-screen grid-cols-1 grid-rows-[72px_auto_1fr_48px] overflow-hidden font-mono text-cyan-300 md:h-screen md:grid-cols-[320px_1fr] md:grid-rows-[82px_1fr_48px]">
      <Header />
      <Sidebar />

      <main className="admin-main overflow-y-auto p-4 md:p-8 xl:p-10">
        <div className="admin-hero mb-5 md:mb-8">
          <div className="flex flex-wrap items-start gap-4 md:items-center md:gap-5">
            <div className="admin-hero-icon">{currentMeta.icon}</div>
            <div>
              <div className="admin-kicker">Operations Console</div>
              <h1 className="admin-hero-title">{currentMeta.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300/70">
                Manage rounds, teams, questions, and user access from a single protected control surface.
              </p>
            </div>
            <div className="admin-hero-user md:ml-auto">
              <span className="admin-hero-user-label">Signed in as</span>
              <span className="admin-hero-user-value">{user?.email || "Admin"}</span>
            </div>
          </div>
        </div>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/rounds" replace />;
  }

  return <Intro />;
}

function TeamContestAutoRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: activeRound } = useGetActiveContestRound(isAuthenticated && !isAdmin, 3000);

  const onAdminPage = location.pathname.startsWith("/admin");
  const onContestPage = location.pathname === "/contest";
  const autoRedirectEligiblePaths = new Set(["/", "/home", "/waiting-room", "/user"]);
  const canAutoRedirectFromCurrentPath = autoRedirectEligiblePaths.has(location.pathname);

  useEffect(() => {
    if (
      activeRound &&
      activeRound.status === "LIVE" &&
      !activeRound.hasSubmitted &&
      !isAdmin &&
      isAuthenticated &&
      canAutoRedirectFromCurrentPath &&
      !onAdminPage &&
      !onContestPage
    ) {
      navigate(`/contest?roundId=${activeRound._id}`, { replace: true });
    }
  }, [activeRound, canAutoRedirectFromCurrentPath, isAdmin, isAuthenticated, navigate, onAdminPage, onContestPage]);

  return null;
}

function GlobalNavbar() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster position="top-right" />
        <BrowserRouter>
          <GlobalNavbar />
          <TeamContestAutoRedirect />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Navigate to="/register" replace />} />
            <Route path="/admin-login" element={<Navigate to="/register?mode=admin" replace />} />

            <Route path="/home" element={<Index />} />
            <Route path="/waiting-room" element={<WaitingRoom />} />
            <Route path="/contest" element={<Contest />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/register" element={<Register />} />
            <Route path="/round-complete" element={<RoundComplete />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/user" element={<UserHomePage />} />
            </Route>

            <Route element={<ProtectedRoute requireAdmin loginPath="/register?mode=admin" />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="rounds" replace />} />
                <Route path="rounds" element={<RoundPanel />} />
                <Route path="questions" element={<QuestionsPanel />} />
                <Route path="teams" element={<TeamsPanel />} />
                <Route path="users" element={<UsersPanel />} />
                <Route path="leaderboard" element={<LeaderboardPanel />} />
                <Route
                  path="monitoring"
                  element={<PlaceholderPanel icon="📊" title="Live Monitoring Dashboard" subtitle="Connect backend monitoring endpoint and websocket stream." />}
                />
              </Route>
            </Route>

            <Route path="/rounds" element={<Navigate to="/admin/rounds" replace />} />
            <Route path="/questions" element={<Navigate to="/admin/questions" replace />} />
            <Route path="/teams" element={<Navigate to="/admin/teams" replace />} />
            <Route path="/users" element={<Navigate to="/admin/users" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
