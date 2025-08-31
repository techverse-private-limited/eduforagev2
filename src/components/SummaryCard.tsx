
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, FileText, Target, Lightbulb, ListTodo, Sparkles } from 'lucide-react';

interface SummaryCardProps {
  data: {
    title?: string;
    summary?: string;
    sections?: string[];
    topics?: string[];
    insights?: string[];
    actionItems?: string[];
  };
  onCopy: (text: string) => void;
  copiedText: string | null;
}

// Helper function to safely convert any value to string
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
};

// Helper function to clean and format section text
const formatSectionText = (text: any): string => {
  const stringText = safeStringify(text);
  if (!stringText || stringText.length === 0) return '';
  
  // Remove markdown formatting and asterisks
  let cleaned = stringText
    .replace(/\*\*/g, '') // Remove bold markdown
    .replace(/\*/g, '') // Remove italic markdown
    .replace(/#{1,6}\s/g, '') // Remove headers
    .trim();
  
  // Split into sentences for better readability
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  
  // Join sentences with proper spacing and capitalize first letter
  return sentences
    .filter(sentence => sentence && sentence.length > 10) // Filter out very short fragments
    .map(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return '';
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .filter(sentence => sentence.length > 0)
    .join(' ');
};

// Helper function to generate section titles
const generateSectionTitle = (text: any, index: number): string => {
  const cleanText = formatSectionText(text);
  
  if (!cleanText || cleanText.length === 0) {
    return `Section ${index + 1}`;
  }
  
  // Try to extract a meaningful title from the first few words
  const words = cleanText.split(' ').slice(0, 4);
  let title = words.join(' ');
  
  // If title is too short or doesn't make sense, use generic titles
  if (title.length < 10) {
    const genericTitles = [
      'Key Features',
      'Main Functions',
      'Important Details',
      'Core Elements',
      'Primary Aspects'
    ];
    title = genericTitles[index % genericTitles.length];
  }
  
  // Ensure title ends properly
  if (!title.match(/[.!?]$/)) {
    title = title.replace(/[,;:]$/, '');
  }
  
  return title;
};

// Helper function to safely render array items
const renderArrayItems = (items: any[]): string[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => formatSectionText(item))
    .filter(item => item && item.length > 0);
};

export const SummaryCard: React.FC<SummaryCardProps> = ({ data, onCopy, copiedText }) => {
  if (!data) return null;

  // Safely extract and format all data
  const safeTitle = data.title ? safeStringify(data.title) : '';
  const safeSummary = data.summary ? formatSectionText(data.summary) : '';
  const safeSections = data.sections ? renderArrayItems(data.sections) : [];
  const safeTopics = data.topics ? renderArrayItems(data.topics) : [];
  const safeInsights = data.insights ? renderArrayItems(data.insights) : [];
  const safeActionItems = data.actionItems ? renderArrayItems(data.actionItems) : [];

  return (
    <div className="space-y-6">
      {/* Title Card */}
      {safeTitle && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              {safeTitle}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Summary Overview */}
      {safeSummary && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between text-blue-700">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executive Summary
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(safeSummary)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                {copiedText === safeSummary ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-base">
              {safeSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Sections */}
      {safeSections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Key Highlights
          </h3>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {safeSections.map((section, index) => {
              // Skip empty sections
              if (!section || section.length < 20) return null;
              
              const sectionTitle = generateSectionTitle(section, index);
              
              return (
                <Card key={index} className="hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between text-orange-700">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{sectionTitle}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(section)}
                        className="h-8 w-8 p-0 hover:bg-orange-100"
                      >
                        {copiedText === section ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {section}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Topics */}
      {safeTopics.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-700 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Main Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {safeTopics.map((topic, index) => (
                <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200 text-sm px-3 py-1">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {safeInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-1 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-gray-700 leading-relaxed text-sm">
                    {insight}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {safeActionItems.length > 0 && (
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safeActionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge className="bg-red-100 text-red-700 text-xs px-2 py-1 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-gray-700 leading-relaxed text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
