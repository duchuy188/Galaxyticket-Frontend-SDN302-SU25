// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Film, Mail, ArrowLeft, Loader2, Check } from 'lucide-react';

// const ForgotPassword: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [isSuccess, setIsSuccess] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email) {
//       setError('Please enter your email address');
//       return;
//     }
    
//     setError('');
//     setIsLoading(true);

//     try {
//       // TODO: Implement actual password reset logic here
//       await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
//       setIsSuccess(true);
//     } catch (err) {
//       setError('Failed to send reset email. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#1a2237] flex items-center justify-center p-4">
//       {/* Back to Sign In Button */}
//       <Link
//         to="/signin"
//         className="fixed top-4 left-4 flex items-center text-gray-400 hover:text-white transition-colors"
//       >
//         <ArrowLeft className="h-5 w-5 mr-1" />
//         <span>Back to Sign In</span>
//       </Link>

//       <div className="max-w-md w-full">
//         <div className="text-center mb-8">
//           <Link to="/" className="inline-block">
//             <div className="flex justify-center items-center space-x-2 mb-4 transform hover:scale-105 transition-transform">
//               <Film className="h-10 w-10 text-red-500" />
//               <h2 className="text-3xl font-bold text-white">Galaxy Cinema</h2>
//             </div>
//           </Link>
//         </div>

//         <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl p-8">
//           <div className="text-center mb-6">
//             <h3 className="text-xl font-semibold text-white">Reset Your Password</h3>
//             <p className="text-gray-400 text-sm mt-2">
//               Enter your email address and we'll send you instructions to reset your password.
//             </p>
//           </div>

//           {error && (
//             <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-shake" role="alert">
//               <span className="block sm:inline">{error}</span>
//             </div>
//           )}

//           {isSuccess ? (
//             <div className="text-center">
//               <div className="flex items-center justify-center mb-4">
//                 <div className="bg-green-900/50 border border-green-700 rounded-full p-2">
//                   <Check className="h-8 w-8 text-green-500" />
//                 </div>
//               </div>
//               <h4 className="text-white font-medium mb-2">Reset Email Sent!</h4>
//               <p className="text-gray-400 text-sm mb-6">
//                 Please check your email for instructions to reset your password.
//               </p>
//               <Link
//                 to="/signin"
//                 className="text-red-400 hover:text-red-300 transition-colors"
//               >
//                 Return to Sign In
//               </Link>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className="h-5 w-5 text-gray-500" />
//                   </div>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     required
//                     className="w-full pl-10 px-3 py-2.5 bg-gray-700/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <Loader2 className="animate-spin h-5 w-5 mr-2" />
//                     Sending Reset Email...
//                   </div>
//                 ) : (
//                   'Send Reset Instructions'
//                 )}
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword; 

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, ArrowLeft, Loader2, Check, Lock, Eye, EyeOff, X, Key } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../utils/api';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const ForgotPassword: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation
  const passwordStrength = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    console.log('📧 handleSendOTP STARTED');
    console.log('Email:', email);
    
    setError('');
    setIsLoading(true);

    try {
      console.log('📧 Sending OTP request...');
      console.log('Request payload:', { email });
      
      // Call API to send OTP
      const response = await api.post('/api/auth/forgot-password', { email });
      
      console.log('📧 Send OTP response:', response.data);
      console.log('Response status:', response.status);
      console.log('Response has message:', !!response.data.message);
      console.log('Response has success:', !!response.data.success);
      
      if (response.data.message || response.data.success) {
        console.log('✅ OTP sent successfully!');
        toast.success('OTP đã gửi tới email của bạn. Vui lòng kiểm tra hộp thư đến.');
        setCurrentStep('otp');
      } else {
        console.log('❌ Failed to send OTP');
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('📧 Error sending OTP:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('Full error object:', err);
      
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
        console.log('📧 400 error message:', errorMessage);
        setError(errorMessage);
      } else if (err.response?.status === 404) {
        setError('Forgot password endpoint not found. Please contact administrator.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
        console.log('📧 Generic error message:', errorMessage);
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // ĐÚNG: Gọi API verify-otp
      const response = await api.post('/api/auth/verify-otp', { email, otp });

      if (response.data.verified) {
        toast.success('OTP đã được xác thực thành công!');
        setCurrentStep('newPassword');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError('New password is required');
      return;
    }

    if (!passwordStrength) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Call API to reset password
      const response = await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      
      if (response.data.message) {
        toast.success('Đã đặt lại mật khẩu thành công!');
        setCurrentStep('success');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Đặt lại mật khẩu';
      case 'otp':
        return 'Nhập mã OTP';
      case 'newPassword':
        return 'Tạo mật khẩu mới';
      case 'success':
        return 'Đặt lại mật khẩu thành công';
      default:
        return 'Đặt lại mật khẩu';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn mã OTP để đặt lại mật khẩu.';
      case 'otp':
        return 'Nhập mã OTP gồm 6 chữ số được gửi đến email của bạn.';
      case 'newPassword':
        return 'Tạo mật khẩu mới cho tài khoản của bạn.';
      case 'success':
        return 'Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.';
      default:
        return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Địa chỉ Email
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
                  placeholder="Nhập email của bạn"
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
                  Đang gửi OTP...
                </div>
              ) : (
                'Gửi mã OTP'
              )}
            </button>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-white mb-2">
                Mã OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  className="w-full pl-10 px-3 py-2.5 bg-gray-700/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Đã gửi OTP đến: <span className="text-white">{email}</span>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep('email')}
                className="flex-1 py-2.5 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Đang xác thực...
                  </div>
                ) : (
                  'Xác thực OTP'
                )}
              </button>
            </div>
          </form>
        );

      case 'newPassword':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                    newPassword !== '' 
                      ? passwordStrength 
                        ? 'border-green-500' 
                        : 'border-yellow-500'
                      : 'border-gray-700'
                  }`}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {newPassword !== '' && (
                <div className="flex items-center mt-2 text-sm">
                  {passwordStrength ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-400">Mật khẩu đủ mạnh (từ 8 ký tự trở lên)</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-yellow-400">Mật khẩu phải có ít nhất 8 ký tự</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                    confirmPassword !== '' 
                      ? passwordsMatch 
                        ? 'border-green-500' 
                        : 'border-red-500'
                      : 'border-gray-700'
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword !== '' && (
                <div className="flex items-center mt-2 text-sm">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-400">Mật khẩu trùng khớp</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-400">Mật khẩu không trùng khớp</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep('otp')}
                className="flex-1 py-2.5 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading || !passwordStrength || !passwordsMatch}
                className="flex-1 flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Đang đặt lại...
                  </div>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-900/50 border border-green-700 rounded-full p-2">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h4 className="text-white font-medium mb-2">Đặt lại mật khẩu thành công!</h4>
            <p className="text-gray-400 text-sm mb-6">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <Link
              to="/signin"
              className="inline-block w-full py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              Đăng nhập
            </Link>
          </div>
        );

      default:
        return null;
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
        <span>Quay lại đăng nhập</span>
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
            <h3 className="text-xl font-semibold text-white">{getStepTitle()}</h3>
            <p className="text-gray-400 text-sm mt-2">
              {getStepDescription()}
            </p>
          </div>

          {/* Progress Steps */}
          {currentStep !== 'success' && (
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'email' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  1
                </div>
                <div className={`w-12 h-1 ${
                  currentStep === 'otp' || currentStep === 'newPassword' ? 'bg-red-600' : 'bg-gray-600'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'otp' ? 'bg-red-600 text-white' : 
                  currentStep === 'newPassword' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  2
                </div>
                <div className={`w-12 h-1 ${
                  currentStep === 'newPassword' ? 'bg-red-600' : 'bg-gray-600'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 'newPassword' ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  3
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-shake" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {renderStepContent()}
        </div>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ForgotPassword;