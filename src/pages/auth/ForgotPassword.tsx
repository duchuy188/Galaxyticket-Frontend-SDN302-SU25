import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, ArrowLeft, Loader2, Check } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement actual password reset logic here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2237] flex items-center justify-center p-4">
      {/* Back to Sign In Button */}
      <Link
        to="/signin"
        className="fixed top-4 left-4 flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        <span>Back to Sign In</span>
      </Link>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex justify-center items-center space-x-2 mb-4 transform hover:scale-105 transition-transform">
              <Film className="h-10 w-10 text-red-500" />
              <h2 className="text-3xl font-bold text-white">Galaxy Cinema</h2>
            </div>
          </Link>
        </div>

        <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white">Reset Your Password</h3>
            <p className="text-gray-400 text-sm mt-2">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-shake" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-900/50 border border-green-700 rounded-full p-2">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h4 className="text-white font-medium mb-2">Reset Email Sent!</h4>
              <p className="text-gray-400 text-sm mb-6">
                Please check your email for instructions to reset your password.
              </p>
              <Link
                to="/signin"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-10 px-3 py-2.5 bg-gray-700/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending Reset Email...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 