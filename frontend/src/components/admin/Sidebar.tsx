import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/admin/rounds", label: "ROUNDS", icon: "🔄" },
  { to: "/admin/questions", label: "QUESTIONS", icon: "📝" },
  { to: "/admin/teams", label: "TEAMS", icon: "👥" },
  { to: "/admin/users", label: "USERS", icon: "👤" },
  { to: "/admin/leaderboard", label: "LEADERBOARD", icon: "🏆" },
  { to: "/admin/monitoring", label: "MONITORING", icon: "📊" },
];

export default function Sidebar() {
  return (
    <aside className="admin-sidebar overflow-x-auto p-3 md:min-h-0 md:overflow-y-auto md:p-6">
      <div className="hidden md:block">
        <div className="admin-side-card mb-6">
          <div className="admin-kicker">Mission Access</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">Admin Mode</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Protected tools for contest flow, moderation, and live oversight.
              </p>
            </div>
            <div className="admin-side-badge">👨‍🚀</div>
          </div>
        </div>
      </div>

      <nav className="flex min-w-max gap-2 md:block md:min-w-0 md:space-y-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `admin-nav-item w-auto whitespace-nowrap md:w-full ${
                isActive
                  ? "admin-nav-item-active"
                  : "admin-nav-item-idle"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-lg md:text-xl">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
                {isActive && <span className="ml-auto text-[10px] uppercase tracking-[0.2em]">Live</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 hidden space-y-3 border-t border-cyan-400/15 pt-6 md:block">
        <div className="admin-kicker">Quick Stats</div>

        <div className="admin-stat-card border-green-400/25 bg-green-400/8">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Running Rounds</p>
          <p className="text-lg font-black text-green-300">1</p>
        </div>

        <div className="admin-stat-card border-cyan-400/25 bg-cyan-400/8">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Active Teams</p>
          <p className="text-lg font-black text-cyan-200">12</p>
        </div>

        <div className="admin-stat-card border-orange-400/25 bg-orange-400/8">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Penalties</p>
          <p className="text-lg font-black text-orange-300">8</p>
        </div>
      </div>
    </aside>
  );
}