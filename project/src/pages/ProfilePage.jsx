import React from 'react';
import { useAuth } from '../context/auth';

const ProfilePage = () => {
  const { user } = useAuth();

  if (user === undefined) return <div>Loading...</div>;
  if (user === null) return <div>User not found. Please sign in.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-12 bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md mt-12">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-400 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4">
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <h2 className="text-2xl font-bold">{user?.name ?? 'User'}</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>
        <div className="mt-8">
          <div className="flex justify-between border-b py-2">
            <span className="text-gray-600 font-medium">Email</span>
            <span className="text-gray-800">{user?.email}</span>
          </div>
          {user?.role && (
            <div className="flex justify-between border-b py-2">
              <span className="text-gray-600 font-medium">Role</span>
              <span className="text-gray-800 capitalize">{user.role}</span>
            </div>
          )}
          {/* Add more details or claims as needed */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
