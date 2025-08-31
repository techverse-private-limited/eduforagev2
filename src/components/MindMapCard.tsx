import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Circle } from 'lucide-react';

interface MindMapProps {
  mindmap: {
    centralNode: string;
    branches: Array<{
      name: string;
      children: string[];
    }>;
  };
}

export const MindMapCard: React.FC<MindMapProps> = ({ mindmap }) => {
  if (!mindmap || !mindmap.branches) return null;

  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
  ];

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-700 flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Mind Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          {/* Central Node */}
          <div className="relative">
            <Badge 
              className="text-lg px-6 py-3 bg-primary/90 text-primary-foreground font-semibold shadow-lg"
            >
              {mindmap.centralNode}
            </Badge>
          </div>

          {/* Branches */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            {mindmap.branches.map((branch, branchIndex) => (
              <div key={branchIndex} className="space-y-3">
                {/* Branch Node */}
                <div className="flex items-center justify-center">
                  <Badge 
                    className={`text-base px-4 py-2 font-medium ${colors[branchIndex % colors.length]} border`}
                  >
                    {branch.name}
                  </Badge>
                </div>

                {/* Children */}
                <div className="space-y-2 pl-4 border-l-2 border-dashed border-gray-300">
                  {branch.children.map((child, childIndex) => (
                    <div key={childIndex} className="flex items-center gap-2">
                      <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
                      <span className="text-sm text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        {child}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Connection Line */}
                {branchIndex < mindmap.branches.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-6 h-px bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};