
import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface Student {
  id: string;
  full_name: string;
  reg_no: string;
  email: string;
}

interface VerificationResult {
  isValid: boolean;
  student: Student | null;
  isLoading: boolean;
  error: string | null;
}

export const useStudentEmailVerification = (email: string) => {
  const [result, setResult] = useState<VerificationResult>({
    isValid: false,
    student: null,
    isLoading: false,
    error: null,
  });

  const debouncedEmail = useDebounce(email, 500);

  const verifyEmail = useCallback(async (emailToVerify: string) => {
    if (!emailToVerify || !emailToVerify.includes('@')) {
      setResult({
        isValid: false,
        student: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    setResult(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: student, error } = await supabase
        .from('profiles')
        .select('id, full_name, reg_no, email')
        .eq('role', 'student')
        .eq('email', emailToVerify)
        .single();

      if (error || !student) {
        setResult({
          isValid: false,
          student: null,
          isLoading: false,
          error: 'Student not found with this email address',
        });
      } else {
        setResult({
          isValid: true,
          student,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setResult({
        isValid: false,
        student: null,
        isLoading: false,
        error: 'Error verifying email address',
      });
    }
  }, []);

  // Verify email when debounced value changes
  React.useEffect(() => {
    verifyEmail(debouncedEmail);
  }, [debouncedEmail, verifyEmail]);

  return result;
};
