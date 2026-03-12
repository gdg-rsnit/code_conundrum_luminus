export default function Footer() {
  return (
    <footer className="admin-footer col-span-1 md:col-span-2">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
        <span className="font-bold uppercase tracking-[0.26em] text-cyan-200">Code Conundrum v2.6</span>
        <span className="hidden text-slate-600 md:inline">•</span>
        <span className="text-slate-400">Protected contest operations workspace</span>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <span className="text-slate-400">Telemetry Stable</span>
        <span className="hidden text-slate-600 md:inline">•</span>
        <span className="flex items-center gap-2 font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Secure Session
        </span>
      </div>
    </footer>
  );
}