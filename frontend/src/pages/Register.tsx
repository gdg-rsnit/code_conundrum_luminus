import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/hooks/authHook';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminMode = new URLSearchParams(location.search).get('mode') === 'admin';
  const { setUser } = useAuth();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setFormError('');

      const response = await loginMutation.mutateAsync({
        email: normalizedEmail,
        password,
      });

      if (!isAdminMode && response.user.role === 'ADMIN') {
        setFormError('Admin account detected. Switch to Admin Login mode.');
        return;
      }

      if (isAdminMode && response.user.role !== 'ADMIN') {
        setFormError('This account is not an admin account.');
        return;
      }

      const authData = {
        user: response.user,
        expiresAt: Date.now() + (3 * 60 * 60 * 1000),
      };

      setUser(response.user);
      localStorage.setItem('cc_auth_user', JSON.stringify(authData));
      localStorage.setItem(
        'cc_team',
        JSON.stringify({
          teamName: normalizedEmail.split('@')[0].toUpperCase() || 'TEAM',
          email: normalizedEmail,
          round: '1',
        }),
      );

      if (response.user.role === 'ADMIN') {
        navigate('/admin/rounds');
      } else {
        navigate('/home');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      setFormError(message);
    }
  };

  const inputClass = 'w-full bg-[#060612] border-2 border-muted-foreground/20 text-foreground font-mono-tech px-3 py-[10px] outline-none transition-all focus:border-primary focus:shadow-[0_0_8px_rgba(0,245,255,0.3)]';

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.5} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-[480px] bg-space-navy border-2 border-primary p-10">
          <h2 className="font-pixel text-xs text-primary text-center mb-8 neon-text-cyan">
            {isAdminMode ? 'ADMIN ACCESS' : 'CADET RECRUITMENT'}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="font-pixel text-[8px] text-muted-foreground block mb-[6px]">EMAIL *</label>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrors(p => ({ ...p, email: '' }));
                  setFormError('');
                }}
                placeholder="Enter user email"
              />
              {errors.email && <p className="font-pixel text-[7px] text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="font-pixel text-[8px] text-muted-foreground block mb-[6px]">PASSWORD *</label>
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrors(p => ({ ...p, password: '' }));
                  setFormError('');
                }}
                placeholder="Enter password"
              />
              {errors.password && <p className="font-pixel text-[7px] text-destructive mt-1">{errors.password}</p>}
            </div>

            {formError && <p className="font-pixel text-[7px] text-destructive mt-1">{formError}</p>}


            <button
              onClick={handleSubmit}
              disabled={loginMutation.isPending}
              className="w-full font-pixel text-[10px] text-foreground py-[14px] bg-accent border-2 border-accent/60 hover:bg-accent/80 transition-all"
              style={{ filter: 'drop-shadow(0 0 8px hsl(270 100% 59% / 0.5))' }}
            >
              {loginMutation.isPending ? '[ AUTHENTICATING... ]' : isAdminMode ? '[ ENTER ADMIN PANEL ]' : '[ ENTER HOME ]'}
            </button>
            <button
              onClick={() => navigate(isAdminMode ? '/register' : '/register?mode=admin')}
              className="w-full font-pixel text-[8px] text-primary py-2 bg-transparent border-2 border-primary/40 hover:bg-primary/10 transition-all mt-4"
            >
              {isAdminMode ? '[ USER LOGIN ]' : '[ ADMIN LOGIN ]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
