import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold">FBI Wanted App</h3>
                        <p className="text-gray-400 mt-1">Access the FBI's Most Wanted database</p>
                    </div>

                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-white transition">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition">
                            Terms of Service
                        </a>
                        <a href="https://www.fbi.gov/wanted"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition">
                            Official FBI Site
                        </a>
                    </div>
                </div>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} FBI Wanted App. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;