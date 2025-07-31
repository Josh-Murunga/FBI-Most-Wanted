import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-indigo-600 text-white">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">FBI Wanted</Link>

                <nav>
                    <ul className="flex space-x-6">
                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link to="/wanted" className="hover:text-indigo-200 transition">
                                        Wanted List
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/profile" className="hover:text-indigo-200 transition">
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="hover:text-indigo-200 transition"
                                    >
                                        Logout
                                    </button>
                                </li>
                                {user && (
                                    <li className="flex items-center">
                                        <span className="bg-indigo-800 rounded-full h-8 w-8 flex items-center justify-center text-sm">
                                            {user.username.charAt(0).toUpperCase()}
                                        </span>
                                    </li>
                                )}
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login" className="hover:text-indigo-200 transition">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="hover:text-indigo-200 transition">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;