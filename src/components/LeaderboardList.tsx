
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  student_id: string;
  score: number;
  rank: number;
  updated_at: string;
  student: {
    full_name: string;
    reg_no: string;
    avatar_url?: string;
  };
}

interface LeaderboardListProps {
  data: LeaderboardEntry[];
  userRank?: LeaderboardEntry | null;
  className?: string;
}

const LeaderboardList = ({ data, userRank, className = "" }: LeaderboardListProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((entry, index) => {
        const isCurrentUser = userRank?.id === entry.id;
        
        return (
          <div
            key={entry.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              isCurrentUser 
                ? 'bg-green-50 border-green-200 shadow-md' 
                : 'bg-white border-gray-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <Badge className={`${getRankBadgeColor(entry.rank)} font-semibold`}>
                    #{entry.rank}
                  </Badge>
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.student.avatar_url} />
                  <AvatarFallback>
                    {entry.student.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <p className={`font-medium ${isCurrentUser ? 'text-green-800' : 'text-gray-900'}`}>
                    {entry.student.full_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm text-green-600 font-normal">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{entry.student.reg_no}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  isCurrentUser ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {entry.score}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaderboardList;
