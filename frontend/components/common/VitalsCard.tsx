import { NodeData } from '@/types';
import { getTriageColor } from '@/lib/data/triage';

export default function VitalsCard({ node, onClick }: { node: NodeData; onClick?: () => void }) {
  const triage = getTriageColor(node);
  const pulseClass =
    triage === 'red'
      ? 'animate-pulse-red'
      : triage === 'yellow'
      ? 'animate-pulse-yellow'
      : 'animate-pulse-green';
  const border =
    triage === 'red'
      ? 'border-accent-red'
      : triage === 'yellow'
      ? 'border-accent-amber'
      : 'border-accent-green';

  return (
    <div
      onClick={onClick}
      className={`glass cut-corners border-l-4 ${border} p-4 rounded-r-lg cursor-pointer hover:bg-bg-tertiary/60 transition ${pulseClass} animate-slide-up`}
    >
      <div className="flex justify-between mb-2">
        <span className="text-sm text-text-secondary">NODE #{node.id}</span>
        <span
          className={`text-xs uppercase font-bold ${
            triage === 'red'
              ? 'text-accent-red'
              : triage === 'yellow'
              ? 'text-accent-amber'
              : 'text-accent-green'
          }`}
        >
          {triage}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-accent-red">favorite</span> <span className="font-mono">{node.hr}</span> BPM
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-accent-amber">pulmonology</span> <span className="font-mono">{node.spo2}</span>%
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-accent-green">speed</span> <span className="font-mono">{(node.gForce ?? 0).toFixed(1)}</span> G
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-text-secondary">battery_full</span> <span className="font-mono">{node.battery}</span>%
        </div>
      </div>
    </div>
  );
}