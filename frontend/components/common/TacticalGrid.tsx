'use client';
import { useEffect, useRef, useState } from 'react';
import { NodeData } from '@/types';
import { getTriageColor } from '@/lib/data/triage';

export default function TacticalGrid({ nodes, onNodeClick, selectedNode, rescueAnimation }: {
  nodes: NodeData[]; onNodeClick: (id: number) => void; selectedNode?: number | null; rescueAnimation?: number | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const worldToCanvas = (wx: number, wy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const cx = (wx - view.x) * view.zoom * (canvas.width / 200) + canvas.width / 2;
    const cy = canvas.height / 2 - (wy - view.y) * view.zoom * (canvas.width / 200);
    return { x: cx, y: cy };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#1a2332'; ctx.lineWidth = 0.5;
    const gs = 20 * view.zoom;
    for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    nodes.forEach(node => {
      const pos = worldToCanvas(node.lat, node.lng);
      const color = getTriageColor(node);
      let fill = color === 'red' ? '#ff0040' : color === 'yellow' ? '#ffaa00' : '#00ff41';
      if (selectedNode === node.id) fill = '#fff';

      ctx.shadowColor = fill;
      ctx.shadowBlur = 10 * view.zoom;
      if (rescueAnimation === node.id) {
        ctx.shadowBlur = 25 * view.zoom;
        ctx.shadowColor = '#00ff41';
      }
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8 * view.zoom, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#e8edf2'; ctx.lineWidth = 1.5 * view.zoom; ctx.stroke();
      ctx.font = `${10 * view.zoom}px monospace`; ctx.fillStyle = '#e8edf2'; ctx.textAlign = 'center';
      ctx.fillText(`N${node.id}`, pos.x, pos.y - 12 * view.zoom);
    });
  }, [nodes, selectedNode, view, rescueAnimation]);

  return (
    <canvas ref={canvasRef} className="w-full h-full min-h-[400px] cursor-crosshair rounded-lg"
      onClick={e => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        for (const node of nodes) {
          const pos = worldToCanvas(node.lat, node.lng);
          if (Math.hypot(mx - pos.x, my - pos.y) < 15) { onNodeClick(node.id); break; }
        }
      }}
      onWheel={e => { e.preventDefault(); setView(p => ({ ...p, zoom: Math.min(4, Math.max(0.5, p.zoom * (e.deltaY > 0 ? 0.9 : 1.1))) })); }}
      onMouseDown={e => { setDragging(true); dragStart.current = { x: e.clientX, y: e.clientY }; }}
      onMouseMove={e => {
        if (!dragging) return;
        const dx = e.clientX - dragStart.current.x, dy = e.clientY - dragStart.current.y;
        const scale = 200 / (canvasRef.current!.width * view.zoom);
        setView(p => ({ ...p, x: p.x - dx * scale, y: p.y + dy * scale }));
        dragStart.current = { x: e.clientX, y: e.clientY };
      }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      tabIndex={0}
      onKeyDown={e => {
        const step = 10 / view.zoom;
        if (e.key === 'ArrowLeft') setView(v => ({ ...v, x: v.x - step }));
        else if (e.key === 'ArrowRight') setView(v => ({ ...v, x: v.x + step }));
        else if (e.key === 'ArrowUp') setView(v => ({ ...v, y: v.y + step }));
        else if (e.key === 'ArrowDown') setView(v => ({ ...v, y: v.y - step }));
      }}
    />
  );
}
