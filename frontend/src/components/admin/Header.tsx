import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  const handleAuthClick = async () => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }

    await logout();
    navigate("/register");
  };

  return (
    <header className="admin-topbar col-span-1 md:col-span-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="admin-logo-mark">CC</div>
        <div className="min-w-0">
          <p className="admin-kicker">Restricted Access</p>
          <h1 className="truncate text-base font-black tracking-[0.22em] text-cyan-100 md:text-lg">
            CODE CONUNDRUM ADMIN
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden items-center gap-3 md:flex">
          <div className="admin-status-pill">
            <span className="admin-status-dot" />
            <span>SYSTEM ONLINE</span>
          </div>
          <div className="admin-meta-chip">
            <span className="text-slate-400">Role</span>
            <span className="font-semibold text-cyan-100">{isAdmin ? "ADMIN" : "USER"}</span>
          </div>
          {user?.email && <div className="admin-meta-chip max-w-[260px] truncate">{user.email}</div>}
        </div>

        <button
          type="button"
          onClick={handleAuthClick}
          className="admin-action-button"
        >
          {isAuthenticated ? "Logout" : "Login"} {isAuthenticated ? (isAdmin ? "(Admin)" : "(User)") : ""}
        </button>
      </div>
    </header>
  );
}