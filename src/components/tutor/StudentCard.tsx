
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpen, CheckCircle, Clock, Star, TrendingUp, CheckCircle2, Mail } from 'lucide-react';

interface StudentCardProps {
  student: {
    id: string;
    full_name: string;
    reg_no: string;
    degree_program: string;
    email: string;
    roadmap?: {
      id: string;
      track_name: string;
      is_verified_by_tutor: boolean;
      roadmap_json: any;
      created_at: string;
    };
    quiz_attempts?: Array<{
      score: number;
      attempted_at: string;
    }>;
  };
  onVerifyRoadmap: (roadmapId: string, isVerified: boolean) => void;
}

const StudentCard = ({ student, onVerifyRoadmap }: StudentCardProps) => {
  const calculateProgress = (roadmapJson: any) => {
    if (!roadmapJson || !roadmapJson.phases) return 0;
    
    const totalSteps = roadmapJson.phases.reduce((acc: number, phase: any) => 
      acc + (phase.steps?.length || 0), 0);
    
    const completedSteps = roadmapJson.phases.reduce((acc: number, phase: any) => 
      acc + (phase.steps?.filter((step: any) => step.completed)?.length || 0), 0);
    
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  const getAverageScore = (attempts: any[]) => {
    if (!attempts || attempts.length === 0) return 0;
    const sum = attempts.reduce((acc, attempt) => acc + attempt.score, 0);
    return Math.round(sum / attempts.length);
  };

  const progress = calculateProgress(student.roadmap?.roadmap_json);
  const averageScore = getAverageScore(student.quiz_attempts);

  return (
    <Card className="border-l-4 border-l-[hsl(142,76%,36%)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {student.full_name}
            </CardTitle>
            <div className="space-y-1 mt-1">
              <p className="text-sm text-muted-foreground">
                {student.reg_no} • {student.degree_program}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                {student.email}
              </div>
            </div>
          </div>
          {student.roadmap?.is_verified_by_tutor && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Student profile information displayed above.
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentCard;
