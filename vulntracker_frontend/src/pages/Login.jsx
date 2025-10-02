import React from 'react';

const Login = () => (
    <section className="flex justify-center mb-12">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Login to VulnTracker</h3>
            <form className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium">Email Address</label>
                    <input type="email" id="email" className="mt-1 w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="your@email.com" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-gray-700 font-medium">Password</label>
                    <input type="password" id="password" className="mt-1 w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="••••••••" />
                </div>
                <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">Forgot Password?</a>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Login</button>
            </form>
            <p className="text-center text-gray-500 mt-4 text-sm">Don't have an account? <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Sign Up</a></p>
        </div>
    </section>
);

export default Login;