
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, TrendingUp, Target, Star, ArrowRight, Lightbulb, Award } from 'lucide-react';

interface ResumeAnalysisResultsProps {
  skillsNeedsToImprove?: string | string[];
  atsScore?: any;
  bestCareerPath?: string;
}

const ResumeAnalysisResults = ({ 
  skillsNeedsToImprove, 
  atsScore, 
  bestCareerPath 
}: ResumeAnalysisResultsProps) => {
  // Parse ATS score if it's a JSON object
  const parseAtsScore = () => {
    if (!atsScore) return null;
    
    if (typeof atsScore === 'object') {
      return atsScore;
    }
    
    try {
      return JSON.parse(atsScore);
    } catch {
      return { score: atsScore, details: 'Score provided' };
    }
  };

  const parsedAtsScore = parseAtsScore();
  const scoreValue = parsedAtsScore?.score || parsedAtsScore?.overall_score || 0;

  // Parse skills that need improvement
  const parseSkills = () => {
    if (!skillsNeedsToImprove) return [];
    
    // Handle if it's already an array
    if (Array.isArray(skillsNeedsToImprove)) {
      return skillsNeedsToImprove;
    }
    
    // Handle if it's a string
    if (typeof skillsNeedsToImprove === 'string') {
      try {
        const parsed = JSON.parse(skillsNeedsToImprove);
        return Array.isArray(parsed) ? parsed : [skillsNeedsToImprove];
      } catch {
        return skillsNeedsToImprove.split(',').map(skill => skill.trim());
      }
    }
    
    // Fallback
    return [skillsNeedsToImprove];
  };

  const skillsList = parseSkills();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const parseCareerPath = (careerPath: string) => {
    if (!careerPath) return { title: '', points: [] };
    
    // Extract title (first sentence or before first colon/period)
    const titleMatch = careerPath.match(/^([^:.!?]*[:.!?]?)/);
    const title = titleMatch ? titleMatch[1].trim() : careerPath.slice(0, 100) + '...';
    
    // Extract numbered points or bullet points
    const points = careerPath
      .split(/\d+\.\s*|\*\*|\*\s*/)
      .filter(point => point.trim().length > 20)
      .map(point => point.trim().replace(/\*\*/g, '').slice(0, 150))
      .filter(point => point.length > 0)
      .slice(0, 4); // Limit to 4 points
    
    return { title, points };
  };

  const careerInfo = parseCareerPath(bestCareerPath || '');

  return (
    <div className="space-y-6">
      {/* ATS Score Card */}
      {parsedAtsScore && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(217, 91%, 60%)' }}>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-xl">ATS Compatibility Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="text-5xl font-bold" style={{ color: 'hsl(217, 91%, 60%)' }}>
                  {scoreValue}%
                </div>
                <div>
                  <div className={`text-xl font-bold ${getScoreColor(scoreValue)} mb-1`}>
                    {getScoreLabel(scoreValue)}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Resume Match Rate
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="secondary" 
                  className="text-lg px-4 py-2 bg-blue-100 text-blue-700 border-blue-200"
                >
                  <Award className="w-4 h-4 mr-2" />
                  ATS Ready
                </Badge>
              </div>
            </div>
            <Progress value={scoreValue} className="w-full h-4 mb-4" />
            {parsedAtsScore.details && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <Lightbulb className="w-4 h-4 inline mr-2" />
                  {parsedAtsScore.details}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skills to Improve Card */}
      {skillsList.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(217, 91%, 60%)' }}>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xl">Skills to Develop</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {skillsList.map((skill, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-800 font-medium">{skill}</span>
                  <ArrowRight className="w-4 h-4 text-orange-400 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Path Card */}
      {bestCareerPath && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3" style={{ color: 'hsl(217, 91%, 60%)' }}>
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xl">Recommended Path</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg text-green-800 mb-2">
                    {careerInfo.title || "Continue developing your expertise"}
                  </h3>
                </div>
              </div>
              
              {careerInfo.points.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Key Action Steps:
                  </h4>
                  {careerInfo.points.map((point, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100"
                    >
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeAnalysisResults;
