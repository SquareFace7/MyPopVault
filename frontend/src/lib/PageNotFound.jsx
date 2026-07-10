import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);
    const { user } = useAuth();
    
    const isAuthenticated = user?.isLoggedIn;
    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    {/* 404 Error Code */}
                    <div className="space-y-2">
                        <h1 className="text-7xl font-black text-gray-800">404</h1>
                        <div className="h-2 w-16 bg-pink-500 mx-auto rounded-full"></div>
                    </div>
                    
                    {/* Main Message */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-wide">
                            Page Not Found
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-bold text-sm">
                            The page <span className="text-pink-500">"{pageName}"</span> could not be found in this application.
                        </p>
                    </div>
                    
                    {/* Admin Note */}
                    {isAuthenticated && isAdmin && (
                        <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border-4 border-yellow-400 text-left shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5 border border-yellow-500">
                                    <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                                </div>
                                <div className="text-left space-y-1">
                                    <p className="text-sm font-black text-yellow-800">Admin Note</p>
                                    <p className="text-xs text-yellow-700 leading-relaxed font-bold">
                                        This page has not been implemented yet. Ask the coding assistant to create it!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Button */}
                    <div className="pt-6">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="inline-flex items-center px-6 py-3 font-black text-xs uppercase tracking-wider text-white bg-gray-800 border-4 border-gray-800 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.85)] hover:bg-gray-700 transition-all focus:outline-none"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}