
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  id: string;
  student_id: string;
  score: number;
  rank: number;
  student: {
    full_name: string;
    reg_no: string;
  };
}

interface LeaderboardChartProps {
  data: LeaderboardEntry[];
  userRank?: LeaderboardEntry | null;
}

const LeaderboardChart = ({ data, userRank }: LeaderboardChartProps) => {
  const { user } = useAuth();

  const chartData = data.map(entry => ({
    name: entry.student.full_name.split(' ')[0], // First name only for space
    score: entry.score,
    rank: entry.rank,
    isCurrentUser: userRank?.id === entry.id,
    reg_no: entry.student.reg_no
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">{data.reg_no}</p>
          <p className="text-blue-600">Score: {data.score}</p>
          <p className="text-green-600">Rank: #{data.rank}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isCurrentUser ? '#10B981' : '#3B82F6'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaderboardChart;
