
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock } from 'lucide-react';
import { useTutorStudents } from '@/hooks/useTutorStudents';
import StudentCard from '@/components/tutor/StudentCard';

const TutorStudents = () => {
  const { students, loading, verificationStatus, verifyRoadmap } = useTutorStudents();

  if (loading || verificationStatus === 'checking') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading students...</div>
      </div>
    );
  }

  // Show verification status message for non-approved tutors
  if (verificationStatus !== 'approved') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-kontora font-bold text-[hsl(142,76%,36%)]">
              Student Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and guide your assigned students
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {verificationStatus === 'pending' ? 'Verification Pending' : 
               verificationStatus === 'rejected' ? 'Verification Rejected' : 
               verificationStatus === 'not_tutor' ? 'Not a Tutor Account' :
               verificationStatus === 'error' ? 'Error Loading Data' :
               'Account Under Review'}
            </h3>
            <p className="text-muted-foreground">
              {verificationStatus === 'pending' 
                ? 'Your tutor verification is under review. Once admin approves, you will have access to all student management features.'
                : verificationStatus === 'rejected'
                ? 'Your tutor verification was rejected. Please contact support for more information.'
                : verificationStatus === 'not_tutor'
                ? 'This account is not registered as a tutor account.'
                : verificationStatus === 'error'
                ? 'There was an error loading your verification status. Please try refreshing the page.'
                : 'Please complete the verification process to access student management features.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-kontora font-bold text-[hsl(142,76%,36%)]">
            Student Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and guide all students in the system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-[hsl(142,76%,36%)]" />
              <span className="font-medium text-[hsl(142,76%,36%)]">
                {students.length} Students
              </span>
            </div>
          </Card>
        </div>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No students found</h3>
            <p className="text-muted-foreground">
              No students have registered in the system yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {students.map((student) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              onVerifyRoadmap={verifyRoadmap}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorStudents;
