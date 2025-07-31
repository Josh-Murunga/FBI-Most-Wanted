import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { user, logout } = useAuth();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        // Call logout API endpoint
        api.post('/api/auth/logout')
            .then(() => {
                logout();
            })
            .catch(err => {
                console.error('Logout error:', err);
                // Still logout locally even if server logout fails
                logout();
            });
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.delete(`/api/auth/user/${user?.id}`);
            logout();
            setMessage('Your account has been successfully deleted.');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                User data not available. Please log in again.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-indigo-600 px-6 py-8">
                    <h1 className="text-2xl font-bold text-white">Your Profile</h1>
                    <p className="text-indigo-200">Manage your account settings</p>
                </div>

                <div className="p-6">
                    {message && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-1">
                            <div className="flex flex-col items-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center mb-4">
                                    <span className="text-4xl font-bold text-gray-500">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold">{user.username}</h2>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Member since: {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium mb-4">Account Information</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <div className="mt-1 text-gray-900">
                                            {user.username}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="mt-1 text-gray-900">
                                            {user.email}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Created
                                        </label>
                                        <div className="mt-1 text-gray-900">
                                            {new Date(user.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium mb-4">Account Actions</h3>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                                Log Out
                            </button>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={isLoading}
                                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;