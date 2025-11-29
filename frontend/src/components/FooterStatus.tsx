import React from 'react';

interface FooterStatusProps {
  health: { status: string; db_status?: string; redis_status?: string } | null;
  isConnected: boolean;
}

export const FooterStatus: React.FC<FooterStatusProps> = ({ health, isConnected }) => {
  const isApiHealthy = health?.status === 'ok' || health?.status === 'healthy';
  const isDbHealthy = health?.db_status === 'ok' || health?.db_status === 'connected';
  const isRedisHealthy = health?.redis_status === 'ok' || health?.redis_status === 'connected';
  const isWsConnected = isConnected;

  const allSystemsGo = isApiHealthy && isDbHealthy && isRedisHealthy && isWsConnected;

  return (
    <footer className="w-full fixed bottom-0 left-0 border-t border-white/5 bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex justify-between items-center text-xs font-mono text-zinc-500 z-50">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${allSystemsGo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
        <span className={allSystemsGo ? 'text-zinc-300' : 'text-red-400'}>
          {allSystemsGo ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM DEGRADED'}
        </span>
      </div>

      <div className="opacity-30 hover:opacity-100 transition-opacity">
        v2.0.4
      </div>
    </footer>
  );
};
