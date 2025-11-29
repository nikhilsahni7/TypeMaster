import React from 'react';

interface FooterStatusProps {
  health: { status: string; db_status?: string; redis_status?: string } | null;
  isConnected: boolean;
}

export const FooterStatus: React.FC<FooterStatusProps> = ({ health, isConnected }) => {
  return (
    <footer className="w-full border-t border-white/5 bg-zinc-900/50 backdrop-blur-md px-8 py-3 flex justify-between items-center text-xs font-mono text-zinc-500">
      <div className="flex gap-6">
        <StatusItem label="API" status={health?.status === 'healthy'} />
        <StatusItem label="POSTGRES" status={health?.db_status === 'connected'} />
        <StatusItem label="REDIS" status={health?.redis_status === 'connected'} />
        <StatusItem label="WS" status={isConnected} />
      </div>
      <div>
        BUILD_ID: <span className="text-zinc-300">v0.1.0-alpha</span>
      </div>
    </footer>
  );
};

function StatusItem({ label, status }: { label: string, status: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
      <span>{label}</span>
    </div>
  );
}
