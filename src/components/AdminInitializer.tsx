
import { useEffect } from 'react';
import { createAdminAccount, checkAdminExists } from '@/utils/adminSetup';

const AdminInitializer = () => {
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        console.log('Checking if admin exists...');
        const adminExists = await checkAdminExists();
        
        if (!adminExists) {
          console.log('No admin found, creating admin account...');
          const created = await createAdminAccount();
          if (created) {
            console.log('Admin account setup completed');
          } else {
            console.error('Failed to create admin account');
          }
        } else {
          console.log('Admin account already exists and is working');
        }
      } catch (error) {
        console.error('Error initializing admin:', error);
      }
    };

    // Run admin initialization on app start with a slight delay
    setTimeout(initializeAdmin, 1000);
  }, []);

  return null; // This component doesn't render anything
};

export default AdminInitializer;
