import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function VitalsTimeline({ data }: { data: { time: number; hr: number; spo2: number; gForce: number }[] }) {
  const chartData = data.map(d => ({
    time: new Date(d.time).toLocaleTimeString(),
    HR: d.hr,
    SpO2: d.spo2,
    GForce: d.gForce,
  }));
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4a" />
          <XAxis dataKey="time" stroke="#6b7a8f" fontSize={10} />
          <YAxis stroke="#6b7a8f" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#141b2d', border: '1px solid #2a3a4a' }} />
          <Legend />
          <Line type="monotone" dataKey="HR" stroke="#ff0040" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="SpO2" stroke="#00aaff" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="GForce" stroke="#ffaa00" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
