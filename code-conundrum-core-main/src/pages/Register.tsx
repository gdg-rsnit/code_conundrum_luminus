import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import Navbar from '@/components/Navbar';
import PixelButton from '@/components/PixelButton';

const Register = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!teamName.trim()) newErrors.teamName = 'Team name is required';
    if (!member1.trim()) newErrors.member1 = 'Member 1 name is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    localStorage.setItem('cc_team', JSON.stringify({ teamName, member1, member2 }));
    navigate('/waiting-room');
  };

  const inputClass = 'w-full bg-[#060612] border-2 border-muted-foreground/20 text-foreground font-mono-tech px-3 py-[10px] outline-none transition-all focus:border-primary focus:shadow-[0_0_8px_rgba(0,245,255,0.3)]';

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.5} />
      <Navbar />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-[480px] bg-space-navy border-2 border-primary p-10">
          <h2 className="font-pixel text-xs text-primary text-center mb-8 neon-text-cyan">
            CADET RECRUITMENT
          </h2>

          <div className="space-y-5">
            <div>
              <label className="font-pixel text-[8px] text-muted-foreground block mb-[6px]">TEAM NAME *</label>
              <input
                className={inputClass}
                value={teamName}
                onChange={e => { setTeamName(e.target.value); setErrors(p => ({ ...p, teamName: '' })); }}
                placeholder="Enter team name"
              />
              {errors.teamName && <p className="font-pixel text-[7px] text-destructive mt-1">{errors.teamName}</p>}
            </div>

            <div>
              <label className="font-pixel text-[8px] text-muted-foreground block mb-[6px]">MEMBER 1 NAME *</label>
              <input
                className={inputClass}
                value={member1}
                onChange={e => { setMember1(e.target.value); setErrors(p => ({ ...p, member1: '' })); }}
                placeholder="Enter member 1 name"
              />
              {errors.member1 && <p className="font-pixel text-[7px] text-destructive mt-1">{errors.member1}</p>}
            </div>

            <div>
              <label className="font-pixel text-[8px] text-muted-foreground block mb-[6px]">MEMBER 2 NAME</label>
              <input
                className={inputClass}
                value={member2}
                onChange={e => setMember2(e.target.value)}
                placeholder="Enter member 2 name (optional)"
              />
            </div>


            <button
              onClick={handleSubmit}
              className="w-full font-pixel text-[10px] text-foreground py-[14px] bg-accent border-2 border-accent/60 hover:bg-accent/80 transition-all"
              style={{ filter: 'drop-shadow(0 0 8px hsl(270 100% 59% / 0.5))' }}
            >
              [ ENTER WAITING ROOM ]
            </button>
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full font-pixel text-[8px] text-primary py-2 bg-transparent border-2 border-primary/40 hover:bg-primary/10 transition-all mt-4"
            >
              [ ADMIN LOGIN ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
