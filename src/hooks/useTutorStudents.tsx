
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Student {
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
}

type VerificationStatus = 'checking' | 'approved' | 'pending' | 'rejected' | 'not_tutor' | 'no_profile' | 'error';

export const useTutorStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('checking');

  useEffect(() => {
    checkVerificationAndFetchStudents();
  }, [user]);

  const checkVerificationAndFetchStudents = async () => {
    if (!user) return;

    try {
      console.log('Checking verification for user:', user.id);
      
      // Get current tutor's profile
      const { data: tutorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, verification_status')
        .eq('user_id', user.id)
        .single();

      console.log('Tutor profile:', tutorProfile);
      
      if (profileError) {
        console.error('Error fetching tutor profile:', profileError);
        setVerificationStatus('error');
        setLoading(false);
        return;
      }

      if (!tutorProfile) {
        console.log('No tutor profile found');
        setVerificationStatus('no_profile');
        setLoading(false);
        return;
      }

      // Check if user role is tutor
      if (tutorProfile.role !== 'tutor') {
        console.log('User is not a tutor, role:', tutorProfile.role);
        setVerificationStatus('not_tutor');
        setLoading(false);
        return;
      }

      // Check if tutor is approved
      if (tutorProfile.verification_status !== 'approved') {
        console.log('Tutor not approved, status:', tutorProfile.verification_status);
        setVerificationStatus(tutorProfile.verification_status || 'pending');
        setLoading(false);
        return;
      }

      setVerificationStatus('approved');
      await fetchAllStudents();
    } catch (error) {
      console.error('Error checking verification:', error);
      setVerificationStatus('error');
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      console.log('Fetching all students for approved tutor');
      
      // Fetch student profiles directly with email from profiles table
      const { data: studentProfiles, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          reg_no, 
          degree_program,
          email,
          user_id
        `)
        .eq('role', 'student');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      console.log('Found student profiles:', studentProfiles);

      if (studentProfiles && studentProfiles.length > 0) {
        // Fetch roadmaps and quiz attempts for each student
        const studentsWithData = await Promise.all(
          studentProfiles.map(async (student) => {
            // Fetch the most recent roadmap for this student
            const { data: roadmap } = await supabase
              .from('roadmaps')
              .select('id, track_name, is_verified_by_tutor, roadmap_json, created_at')
              .eq('student_id', student.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Fetch quiz attempts for this student
            const { data: quizAttempts } = await supabase
              .from('quiz_attempts')
              .select('score, attempted_at')
              .eq('student_id', student.id)
              .order('attempted_at', { ascending: false })
              .limit(5);

            return {
              ...student,
              email: student.email || 'No email found',
              roadmap: roadmap || undefined,
              quiz_attempts: quizAttempts || []
            };
          })
        );

        console.log('Final students data:', studentsWithData);
        setStudents(studentsWithData);
      } else {
        console.log('No student profiles found');
        setStudents([]);
      }
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

  const verifyRoadmap = async (roadmapId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('roadmaps')
        .update({ is_verified_by_tutor: isVerified })
        .eq('id', roadmapId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Roadmap ${isVerified ? 'verified' : 'unverified'} successfully`,
      });
      
      // Refresh students data
      checkVerificationAndFetchStudents();
    } catch (error) {
      console.error('Error updating roadmap verification:', error);
      toast({
        title: "Error",
        description: "Failed to update roadmap verification",
        variant: "destructive"
      });
    }
  };

  return {
    students,
    loading,
    verificationStatus,
    verifyRoadmap,
    refetch: checkVerificationAndFetchStudents
  };
};
