
import { supabase } from '@/integrations/supabase/client';

export const createAdminAccount = async () => {
  try {
    console.log('Creating admin account...');
    
    // First, try to sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@gmail.com',
      password: '12345',
      options: {
        data: {
          full_name: 'Administrator',
          role: 'admin',
        },
      },
    });

    if (error) {
      console.error('Error creating admin account:', error);
      
      // If user already exists, that's fine - they just need to be able to sign in
      if (error.message.includes('User already registered')) {
        console.log('Admin user already exists, checking if profile exists...');
        return await ensureAdminProfile();
      }
      return false;
    }

    console.log('Admin account created successfully:', data);
    
    // Wait a bit for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error in createAdminAccount:', error);
    return false;
  }
};

// Function to ensure admin profile exists even if user was created before
const ensureAdminProfile = async () => {
  try {
    // Try to sign in as admin to get the user ID
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@gmail.com',
      password: '12345',
    });

    if (signInError) {
      console.error('Cannot sign in as admin to check profile:', signInError);
      return false;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      console.error('No user ID found after admin sign in');
      return false;
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking admin profile:', profileError);
      return false;
    }

    if (!profile) {
      console.log('Creating admin profile...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: 'Administrator',
          role: 'admin',
        });

      if (insertError) {
        console.error('Error creating admin profile:', insertError);
        return false;
      }
    } else if (profile.role !== 'admin') {
      // Update existing profile to admin role
      console.log('Updating profile to admin role...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile to admin:', updateError);
        return false;
      }
    }

    // Sign out after setup
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    console.error('Error in ensureAdminProfile:', error);
    return false;
  }
};

// Function to check if admin account exists
export const checkAdminExists = async () => {
  try {
    // Try to sign in as admin to verify the account works
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@gmail.com',
      password: '12345',
    });

    if (error) {
      console.error('Admin account does not exist or cannot sign in:', error);
      return false;
    }

    if (data.user) {
      console.log('Admin account verified');
      // Sign out after verification
      await supabase.auth.signOut();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in checkAdminExists:', error);
    return false;
  }
};
