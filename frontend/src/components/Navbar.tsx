import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import GdgLogo from './GdgLogo';
import { useAuth } from '@/context/AuthContext';

const baseNavItems = [
  { label: 'HOME', path: '/home' },
  { label: 'WAITING ROOM', path: '/waiting-room' },
  { label: 'LEADERBOARD', path: '/leaderboard' },
  { label: 'RULES', path: '/rules' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const navItems = isAuthenticated
    ? baseNavItems
    : [...baseNavItems, { label: 'REGISTER', path: '/register' }];

  const handleLogout = async () => {
    await logout();
    navigate('/register');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-space-navy/80 backdrop-blur-sm border-b-4 border-primary/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + separator + title */}
        <Link to="/home" className="flex items-center gap-3 group">
          <GdgLogo height={36} />
          <div
            className="hidden sm:block"
            style={{
              width: '2px',
              height: '28px',
              background: 'hsl(180 100% 50% / 0.6)',
            }}
          />
          <span className="font-pixel text-[10px] md:text-xs text-primary neon-text-cyan">
            CODE CONUNDRUM
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'font-pixel text-[9px] uppercase tracking-wider transition-all relative pb-1',
                'hover:text-secondary',
                location.pathname === item.path
                  ? 'text-secondary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-secondary'
                  : 'text-muted-foreground after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-secondary after:transition-all hover:after:w-full'
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className={cn(
                'font-pixel text-[9px] uppercase tracking-wider transition-all relative pb-1 text-muted-foreground hover:text-secondary',
                'after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-secondary after:transition-all hover:after:w-full'
              )}
            >
              LOGOUT
            </button>
          )}
        </div>

        {/* Mobile menu icon */}
        <div className="md:hidden font-pixel text-primary text-xs">=</div>
      </div>
    </nav>
  );
};

export default Navbar;
