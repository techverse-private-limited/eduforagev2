
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, BarChart3, List, Users, Star, TrendingUp } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import LeaderboardChart from '@/components/LeaderboardChart';
import LeaderboardList from '@/components/LeaderboardList';
import { Badge } from '@/components/ui/badge';

const Leaderboard = () => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const { leaderboard, userRank, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-kontora font-black text-blue-dark mb-2">
          Leaderboard
        </h2>
        <p className="text-blue-600 font-poppins text-sm lg:text-base">
          Real-time quiz rankings and performance tracking
        </p>
      </div>

      {/* User Stats Card */}
      {userRank && (
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Current Rank</h3>
                  <p className="text-gray-600">Keep up the great work!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-green-100 text-green-800 text-xl font-bold px-3 py-1">
                    #{userRank.rank}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-green-600">{userRank.score} pts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-xl font-bold text-blue-600">{leaderboard.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Top Score</p>
                <p className="text-xl font-bold text-yellow-600">
                  {leaderboard.length > 0 ? leaderboard[0].score : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-xl font-bold text-green-600">
                  {leaderboard.length > 0 
                    ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Leaderboard Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: 'hsl(217, 91%, 60%)' }}>
              <Trophy className="w-5 h-5" />
              <span>Quiz Rankings</span>
              <Badge variant="secondary" className="ml-2">
                Live Updates
              </Badge>
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Chart
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No quiz results yet</h3>
              <p className="text-gray-500">
                Take some quizzes to see your ranking here!
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'chart' ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Interactive chart showing top performers. Your bar is highlighted in green.
                  </p>
                  <LeaderboardChart data={leaderboard} userRank={userRank} />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Detailed ranking list with scores and positions. You are highlighted in green.
                  </p>
                  <LeaderboardList data={leaderboard} userRank={userRank} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
