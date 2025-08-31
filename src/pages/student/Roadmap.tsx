import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, User, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Roadmap = () => {
  const { user } = useAuth();
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customDuration, setCustomDuration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [showRoadmapResult, setShowRoadmapResult] = useState(false);

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', description: 'Little to no prior knowledge' },
    { id: 'intermediate', label: 'Intermediate', description: 'Some experience, looking to advance' },
    { id: 'advanced', label: 'Advanced', description: 'Experienced, looking to master' }
  ];

  const timeframes = [
    { id: '1-month', label: '1 Month' },
    { id: '3-months', label: '3 Months' },
    { id: '6-months', label: '6 Months' },
    { id: '1-year', label: '1 Year' },
    { id: '2-years', label: '2 Years' },
    { id: 'custom', label: 'Custom' }
  ];

  const topics = [
    {
      id: 'javascript',
      name: 'JavaScript',
      description: 'High-level programming language core to web development',
      icon: '🟨',
      color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
    },
    {
      id: 'python',
      name: 'Python',
      description: 'High-level programming language for general purposes',
      icon: '🐍',
      color: 'bg-green-100 border-green-300 hover:bg-green-200'
    },
    {
      id: 'react',
      name: 'React',
      description: 'JavaScript library for building user interfaces',
      icon: '⚛️',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      description: 'JavaScript runtime for server-side programming',
      icon: '🟢',
      color: 'bg-green-100 border-green-300 hover:bg-green-200'
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      description: 'JavaScript with static type definitions',
      icon: '🔷',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'java',
      name: 'Java',
      description: 'Object-oriented programming language',
      icon: '☕',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200'
    },
    {
      id: 'sql',
      name: 'SQL',
      description: 'Language for managing relational databases',
      icon: '🗃️',
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200'
    },
    {
      id: 'machine-learning',
      name: 'Machine Learning',
      description: 'Artificial intelligence discipline',
      icon: '🤖',
      color: 'bg-pink-100 border-pink-300 hover:bg-pink-200'
    },
    {
      id: 'data-science',
      name: 'Data Science',
      description: 'Extracting insights from data',
      icon: '📊',
      color: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200'
    },
    {
      id: 'web-development',
      name: 'Web Development',
      description: 'Building and maintaining websites',
      icon: '🌐',
      color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200'
    },
    {
      id: 'mobile-development',
      name: 'Mobile Development',
      description: 'Creating applications for mobile devices',
      icon: '📱',
      color: 'bg-teal-100 border-teal-300 hover:bg-teal-200'
    },
    {
      id: 'devops',
      name: 'DevOps',
      description: 'Development and operations practices',
      icon: '⚙️',
      color: 'bg-gray-100 border-gray-300 hover:bg-gray-200'
    },
    {
      id: 'cloud-computing',
      name: 'Cloud Computing',
      description: 'Internet-based computing services',
      icon: '☁️',
      color: 'bg-sky-100 border-sky-300 hover:bg-sky-200'
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      description: 'Protection of digital systems',
      icon: '🔒',
      color: 'bg-red-100 border-red-300 hover:bg-red-200'
    },
    {
      id: 'ui-ux-design',
      name: 'UI/UX Design',
      description: 'User interface and experience design',
      icon: '🎨',
      color: 'bg-violet-100 border-violet-300 hover:bg-violet-200'
    },
    {
      id: 'artificial-intelligence',
      name: 'Artificial Intelligence',
      description: 'Intelligence demonstrated by machines',
      icon: '🧠',
      color: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200'
    }
  ];

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedExperience || !selectedTimeframe || selectedTopics.length === 0) {
      alert('Please select experience level, timeframe, and at least one topic');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Get student profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('Profile error:', profileError);
        throw new Error('Student profile not found. Please complete your profile setup first.');
      }

      // Call the edge function to generate roadmap
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          experience: selectedExperience,
          timeframe: selectedTimeframe,
          topics: selectedTopics,
          customDuration: selectedTimeframe === 'custom' ? customDuration : null,
          studentId: profileData.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Roadmap generated successfully!');
        setGeneratedRoadmap(data.roadmap);
        setShowRoadmapResult(true);
      } else {
        throw new Error(data?.error || 'Failed to generate roadmap');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error(error.message || 'Failed to generate roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-kontora font-black text-primary mb-4">
          AI-Powered Learning Roadmap
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate a personalized learning path with detailed milestones
        </p>
      </div>

      {/* Experience Level Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-kontora font-black text-foreground mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Your Experience Level:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experienceLevels.map((level) => (
            <Card 
              key={level.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedExperience === level.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedExperience(level.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-kontora font-bold text-lg">{level.label}</h3>
                  {selectedExperience === level.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{level.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Select Topics Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-kontora font-black text-foreground mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Choose technologies you want to learn:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedTopics.includes(topic.id)
                  ? 'border-primary bg-primary/5'
                  : `border-border hover:border-primary/50 ${topic.color}`
              }`}
              onClick={() => toggleTopic(topic.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{topic.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-kontora font-bold text-sm">{topic.name}</h3>
                      {selectedTopics.includes(topic.id) && (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {selectedTopics.length > 0 && (
          <p className="text-sm text-muted-foreground mt-6 text-center">
            {selectedTopics.length} topic{selectedTopics.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Learning Timeframe Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-kontora font-black text-foreground mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Learning Timeframe:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.id}
              variant={selectedTimeframe === timeframe.id ? "default" : "outline"}
              onClick={() => setSelectedTimeframe(timeframe.id)}
              className="h-12"
            >
              {timeframe.label}
            </Button>
          ))}
        </div>
        
        {selectedTimeframe === 'custom' && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter custom duration (e.g., 4 months, 18 weeks)"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={handleGenerateRoadmap}
          size="lg"
          className="px-12 py-4 text-lg font-kontora font-bold"
          disabled={!selectedExperience || !selectedTimeframe || selectedTopics.length === 0 || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Roadmap...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Roadmap
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Roadmap;