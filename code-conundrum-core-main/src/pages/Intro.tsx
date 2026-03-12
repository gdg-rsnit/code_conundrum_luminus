import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GdgCanvasLogo from '@/components/GdgCanvasLogo';
import StarfieldBackground from '@/components/StarfieldBackground';
import { PixelRocket, PixelSatellite } from '@/components/PixelIcons';

const Intro = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The animation takes ~4250ms to reach the "hold" phase.
    // Give it 5 seconds completely, then navigate to /home.
    const timer = setTimeout(() => {
      navigate('/home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-background scanline-overlay flex items-center justify-center overflow-hidden">
      <StarfieldBackground showClouds={true} showPlanets={true} />

      {/* Floating pixel rocket */}
      <div className="absolute left-[8%] top-[35%] animate-rocket opacity-70">
        <PixelRocket size={48} />
      </div>

      {/* Floating satellite */}
      <div className="absolute right-[12%] top-[25%] animate-satellite opacity-70">
        <PixelSatellite size={56} />
      </div>

      <div className="z-10 animate-wIn scale-125 md:scale-150">
        <GdgCanvasLogo />
      </div>
    </div>
  );
};

export default Intro;
