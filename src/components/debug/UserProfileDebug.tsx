import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export const UserProfileDebug = () => {
  const { user, profile, isRole } = useAuth();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">User Profile Debug</h3>
      <div className="space-y-2">
        <div><strong>User ID:</strong> {user?.id || 'Not logged in'}</div>
        <div><strong>User Email:</strong> {user?.email || 'No email'}</div>
        <div><strong>Profile ID:</strong> {profile?.id || 'No profile'}</div>
        <div><strong>Profile Role:</strong> {profile?.role || 'No role'}</div>
        <div><strong>Profile Auth Role:</strong> {profile?.auth_role || 'No auth_role'}</div>
        <div><strong>Is Admin:</strong> {isRole('admin') ? 'Yes' : 'No'}</div>
        <div><strong>Is Super Admin:</strong> {isRole('super_admin') ? 'Yes' : 'No'}</div>
        <div><strong>Can Manage Requests:</strong> {(isRole('admin') || isRole('super_admin')) ? 'Yes' : 'No'}</div>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold">Full Profile Object:</h4>
        <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
};