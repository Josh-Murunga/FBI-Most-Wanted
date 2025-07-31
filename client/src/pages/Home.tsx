import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                    FBI Wanted Dashboard
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Access the FBI's most wanted database with enhanced search capabilities
                </p>

                {user ? (
                    <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
                            Welcome back, {user.username}!
                        </h2>
                        <p className="text-gray-700 mb-6">
                            You have full access to the FBI wanted database. Start exploring now.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/wanted"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                                View Wanted List
                            </Link>
                            <Link
                                to="/profile"
                                className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition"
                            >
                                View Profile
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
                            Authentication Required
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Please log in or register to access the FBI wanted database.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="text-indigo-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Wanted Persons</h3>
                        <p className="text-gray-600">
                            Browse the complete list of individuals wanted by the FBI with detailed profiles.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="text-indigo-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
                        <p className="text-gray-600">
                            Use our powerful search tools to find specific individuals based on various criteria.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="text-indigo-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
                        <p className="text-gray-600">
                            Your account is protected with industry-standard security protocols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;