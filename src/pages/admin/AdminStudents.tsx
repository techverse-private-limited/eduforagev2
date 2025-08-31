
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Star, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  reg_no: string;
  degree_program: string;
  learning_speed: string;
  created_at: string;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `https://gprtclzwkgtyvrrgifpu.supabase.co/rest/v1/profiles?role=eq.student&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnRjbHp3a2d0eXZycmdpZnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzUwMTMsImV4cCI6MjA3MjExMTAxM30.HF-wu4NIWG0L4wUP2gvUVr8127jRHWz-sN5mZAQY5Vk',
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-kontora font-bold text-[hsl(0,84%,60%)]">
              Student Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor student activity and progress
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {students.length} total students
            </div>
          </div>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p className="text-muted-foreground">
                Students will appear here once they register
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {student.full_name || 'Unnamed Student'}
                      </CardTitle>
                      <div className="flex flex-col gap-1 mt-2">
                        {student.reg_no && (
                          <p className="text-sm text-muted-foreground">
                            Registration: {student.reg_no}
                          </p>
                        )}
                        {student.degree_program && (
                          <p className="text-sm text-muted-foreground">
                            Program: {student.degree_program}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(student.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {student.learning_speed || 'Medium'} Learner
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      View Roadmaps
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      View Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      View Meetings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;
