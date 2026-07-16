import { NodeData } from '@/types';
export function getTriageColor(node: NodeData) {
  if (node.hr > 120 || node.spo2 < 90 || node.gForce > 3.0) return 'red';
  if (node.hr > 100 || node.spo2 < 95 || node.gForce > 1.5) return 'yellow';
  return 'green';
}
export function getTriageCounts(nodes: NodeData[]) {
  const counts: any = { GREEN:0, YELLOW:0, RED:0, BLACK:0 };
  nodes.forEach(n => counts[getTriageColor(n).toUpperCase()]++);
  return counts;
}
