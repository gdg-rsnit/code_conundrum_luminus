import gdgLogo from '@/assets/gdg-logo2.jpeg';

const GdgCanvasLogo = () => {
  return (
    <div className="flex flex-col items-center mb-10 z-20 relative">
      <div className="flex items-center justify-center h-[130px] mb-2 animate-float">
        <img 
          src={gdgLogo} 
          alt="GDGoC Logo" 
          style={{ 
            height: '100px', 
            width: 'auto', 
            objectFit: 'contain', 
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' 
          }} 
        />
      </div>
      <div className="flex flex-col items-center mt-[-10px]">
        <div className="intro-wordmark animate-wIn" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <span className="g-blue">G</span><span className="g-red">D</span><span className="g-grn">G</span><span
            className="g-wht">o</span><span className="g-yellow">C</span>
          &nbsp;
          <span className="g-wht">R</span><span className="g-blue">N</span><span className="g-red">S</span><span
            className="g-grn">I</span><span className="g-yellow">T</span>
        </div>
        <div className="intro-sub animate-wIn" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
          C S E &nbsp; D E P T &nbsp; &middot; &nbsp; 2 0 2 5
        </div>
        <div className="intro-dots">
          <div className="intro-dot" style={{ animationDelay: '1.5s' }}></div>
          <div className="intro-dot" style={{ animationDelay: '1.7s' }}></div>
          <div className="intro-dot" style={{ animationDelay: '1.9s' }}></div>
          <div className="intro-dot" style={{ animationDelay: '2.1s' }}></div>
        </div>
        <div className="intro-presents" style={{ animationDelay: '2.5s' }}>&mdash; PRESENTS &mdash;</div>
      </div>
    </div>
  );
};

export default GdgCanvasLogo;
