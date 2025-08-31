
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, HelpCircle, Star, Trophy, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: string;
}

interface Quiz {
  id: string;
  title: string;
  difficulty: string;
  questions: Question[];
}

const Quizzes = () => {
  const { user } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [profileId, setProfileId] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'low' | 'medium' | 'high'>('medium');
  const [timeLimit, setTimeLimit] = useState(10);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Fetch user profile on component load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setPlayerName(data.full_name || 'Anonymous User');
          setProfileId(data.id);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const topics = [
    {
      id: 'javascript',
      name: 'JavaScript',
      description: 'High-level programming language core to web development',
      icon: '🟨',
      color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
    },
    {
      id: 'html',
      name: 'HTML',
      description: 'Markup language for creating web pages',
      icon: '🟧',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200'
    },
    {
      id: 'css',
      name: 'CSS',
      description: 'Style sheet language for designing web pages',
      icon: '🟦',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
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
      id: 'python',
      name: 'Python',
      description: 'High-level programming language for general purposes',
      icon: '🐍',
      color: 'bg-green-100 border-green-300 hover:bg-green-200'
    },
    {
      id: 'java',
      name: 'Java',
      description: 'Object-oriented programming language',
      icon: '☕',
      color: 'bg-red-100 border-red-300 hover:bg-red-200'
    },
    {
      id: 'cpp',
      name: 'C++',
      description: 'Extension of C with classes and objects',
      icon: '🔷',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'ruby',
      name: 'Ruby',
      description: 'Dynamic, object-oriented programming language',
      icon: '💎',
      color: 'bg-red-100 border-red-300 hover:bg-red-200'
    },
    {
      id: 'php',
      name: 'PHP',
      description: 'Server-side scripting language for web development',
      icon: '🟪',
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200'
    },
    {
      id: 'swift',
      name: 'Swift',
      description: 'Programming language for iOS and macOS development',
      icon: '🔶',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200'
    },
    {
      id: 'kotlin',
      name: 'Kotlin',
      description: 'Cross-platform, statically typed language',
      icon: '🟣',
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200'
    },
    {
      id: 'go',
      name: 'Go',
      description: 'Statically typed language by Google',
      icon: '🔷',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'rust',
      name: 'Rust',
      description: 'Systems programming with memory safety',
      icon: '🦀',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200'
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      description: 'JavaScript with static type definitions',
      icon: '🔷',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'sql',
      name: 'SQL',
      description: 'Language for managing relational databases',
      icon: '🗃️',
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200'
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      description: 'NoSQL database program',
      icon: '🍃',
      color: 'bg-green-100 border-green-300 hover:bg-green-200'
    },
    {
      id: 'graphql',
      name: 'GraphQL',
      description: 'Query language for APIs',
      icon: '⚫',
      color: 'bg-gray-100 border-gray-300 hover:bg-gray-200'
    },
    {
      id: 'docker',
      name: 'Docker',
      description: 'Platform for developing, shipping, and running applications',
      icon: '🐳',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      description: 'Container orchestration system',
      icon: '☸️',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'aws',
      name: 'AWS',
      description: 'Amazon Web Services cloud platform',
      icon: '☁️',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200'
    },
    {
      id: 'azure',
      name: 'Azure',
      description: 'Microsoft cloud computing service',
      icon: '☁️',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200'
    },
    {
      id: 'git',
      name: 'Git',
      description: 'Distributed version control system',
      icon: '📁',
      color: 'bg-red-100 border-red-300 hover:bg-red-200'
    },
    {
      id: 'machine-learning',
      name: 'Machine Learning',
      description: 'Artificial intelligence discipline',
      icon: '🤖',
      color: 'bg-pink-100 border-pink-300 hover:bg-pink-200'
    },
    {
      id: 'artificial-intelligence',
      name: 'Artificial Intelligence',
      description: 'Intelligence demonstrated by machines',
      icon: '🧠',
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200'
    }
  ];

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleStartChallenge = async () => {
    if (!playerName.trim()) {
      toast.error('Player name is required');
      return;
    }
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          topics: selectedTopics,
          difficulty,
          numQuestions
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      setCurrentQuiz(data.quiz);
      setSelectedAnswers({});
      setShowResults(false);
      setQuizCompleted(false);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error(error.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz || !profileId) return;

    // Calculate score
    let correctCount = 0;
    const answers = currentQuiz.questions.map(q => {
      const selectedIndex = selectedAnswers[q.id];
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctCount++;
      
      return {
        questionId: q.id,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect
      };
    });

    const finalScore = Math.round((correctCount / currentQuiz.questions.length) * 100);
    setScore(finalScore);

    try {
      // Save quiz attempt to database
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: currentQuiz.id,
          student_id: profileId,
          score: finalScore,
          answers: answers
        });

      if (error) {
        console.error('Error saving quiz attempt:', error);
        toast.error('Failed to save quiz results');
      } else {
        toast.success(`Quiz completed! Score: ${finalScore}%`);
      }
    } catch (error) {
      console.error('Error in handleSubmitQuiz:', error);
      toast.error('Failed to save quiz results');
    }

    setShowResults(true);
    setQuizCompleted(true);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizCompleted(false);
    setScore(0);
  };

  // If quiz is active, show quiz interface
  if (currentQuiz && !quizCompleted) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-kontora font-black text-blue-600">
                  {currentQuiz.title}
                </h1>
                <p className="text-gray-600">
                  Difficulty: <Badge variant="outline" className="ml-1">{currentQuiz.difficulty}</Badge>
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={resetQuiz}>
              Back to Setup
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {currentQuiz.questions.map((question, index) => (
            <Card key={question.id} className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1}: {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAnswers[question.id] === optionIndex
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionIndex}
                        checked={selectedAnswers[question.id] === optionIndex}
                        onChange={() => handleAnswerSelect(question.id, optionIndex)}
                        className="mr-3"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmitQuiz}
            size="lg"
            className="px-12 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
            disabled={Object.keys(selectedAnswers).length !== currentQuiz.questions.length}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Submit Quiz
          </Button>
        </div>
      </div>
    );
  }

  // If showing results
  if (showResults && currentQuiz) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-kontora font-black text-blue-600 mb-2">
            Quiz Completed!
          </h1>
          <p className="text-xl text-gray-700">
            Your Score: <span className="font-bold text-blue-600">{score}%</span>
          </p>
        </div>

        <div className="space-y-6">
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = selectedAnswers[question.id];
            const isCorrect = userAnswer === question.correctIndex;

            return (
              <Card key={question.id} className={`border-2 ${isCorrect ? 'border-green-300' : 'border-red-300'}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs">✗</span>
                      </div>
                    )}
                    Question {index + 1}: {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Your answer:</strong> {question.options[userAnswer]}</p>
                    <p><strong>Correct answer:</strong> {question.options[question.correctIndex]}</p>
                    <p className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center space-x-4">
          <Button
            onClick={resetQuiz}
            size="lg"
            className="px-8 py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Take Another Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Main quiz setup interface
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl lg:text-4xl font-kontora font-black text-blue-600">
            AI Mock Test
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Test your knowledge and earn points!
        </p>
      </div>

      {/* Player Name Input - Auto-filled and read-only */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          Your Name:
        </label>
        <Input
          type="text"
          value={playerName}
          readOnly
          className="w-full text-lg p-4 border-2 border-gray-300 bg-gray-50"
        />
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">⚡</span>
          <h2 className="text-xl font-bold text-gray-800">Select Difficulty:</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['low', 'medium', 'high'].map((level) => (
            <Card
              key={level}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                difficulty === level
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setDifficulty(level as 'low' | 'medium' | 'high')}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 capitalize">{level}</h3>
                  {difficulty === level && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <p className="text-gray-600 text-sm">
                  {level === 'low' && 'Basic concepts and definitions'}
                  {level === 'medium' && 'Intermediate application of concepts'}
                  {level === 'high' && 'Advanced problem-solving'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Select Topics */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🧠</span>
          <h2 className="text-xl font-bold text-gray-800">Select Topics:</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedTopics.includes(topic.id)
                  ? 'border-blue-500 bg-blue-50'
                  : `border-gray-200 hover:border-blue-300 ${topic.color}`
              }`}
              onClick={() => toggleTopic(topic.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{topic.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-800">{topic.name}</h3>
                      {selectedTopics.includes(topic.id) && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quiz Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Clock className="w-6 h-6 text-purple-600" />
          <div>
            <p className="font-semibold text-gray-800">Time Limit:</p>
            <p className="text-lg font-bold text-purple-600">{timeLimit} minutes</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <HelpCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-gray-800">Number of Questions:</p>
            <p className="text-lg font-bold text-green-600">{numQuestions} questions</p>
          </div>
        </div>
      </div>

      {/* Game Features */}
      <Card className="mb-8 border-l-4 border-l-orange-500 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-orange-800">Game Features:</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-orange-700">Earn points for correct answers</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-orange-700">AI-generated questions based on difficulty</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-orange-700">Detailed explanations for each answer</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Challenge Button */}
      <div className="text-center">
        <Button
          onClick={handleStartChallenge}
          size="lg"
          className="px-12 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!playerName.trim() || selectedTopics.length === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Start Challenge
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Quizzes;
