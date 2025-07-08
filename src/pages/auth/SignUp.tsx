import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Check, X, ArrowLeft } from 'lucide-react';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0: return 'Rất yếu';
      case 1: return 'Yếu';
      case 2: return 'Trung bình';
      case 3: return 'Mạnh';
      case 4: return 'Rất mạnh';
      default: return '';
    }
  };

  const validateForm = () => {
    if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      setError('Số điện thoại phải có đúng 10 chữ số');
      return false;
    }
    if (!acceptTerms) {
      setError('Vui lòng đồng ý với Điều khoản và Điều kiện');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return false;
    }
    if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      setError('Vui lòng nhập số điện thoại hợp lệ');
      return false;
    }
    if (!formData.fullName.trim()) {
      setError('Họ tên là bắt buộc');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Map fullName thành name cho backend
      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const success = await register(userData);

      if (success) {
        navigate('/signin');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[#1a2237] flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        <span>Về Trang Chủ</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex justify-center items-center space-x-2 mb-4 transform hover:scale-105 transition-transform">
              <Film className="h-10 w-10 text-red-500" />
              <h2 className="text-3xl font-bold text-white">Galaxy Cinema</h2>
            </div>
          </Link>
          <p className="text-gray-400">Tạo tài khoản của bạn</p>
        </div>

        <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white">Tham gia Galaxy Cinema</h3>
            <p className="text-gray-400 text-sm">Điền thông tin chi tiết để tạo tài khoản</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-shake" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full pl-10 px-3 py-2.5 bg-gray-700/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập họ và tên của bạn"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
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
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full pl-10 px-3 py-2.5 bg-gray-700/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập số điện thoại của bạn"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 px-3 py-2.5 bg-gray-700/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tạo mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full ${
                          index < passwordStrength
                            ? index < 2
                              ? 'bg-red-500'
                              : index < 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-sm mt-1 ${
                    passwordStrength < 2
                      ? 'text-red-400'
                      : passwordStrength < 3
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}>
                    {getPasswordStrengthText(passwordStrength)}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Xác nhận mật khẩu
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
                  className="w-full pl-10 px-3 py-2.5 bg-gray-700/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Xác nhận mật khẩu của bạn"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center mt-2 text-sm">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-400">Mật khẩu khớp</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-400">Mật khẩu không khớp</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-300">
                Tôi đồng ý với{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-red-500 underline hover:text-red-400"
                >
                  Điều khoản và Điều kiện
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-2 text-white font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng ký'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/signin" className="text-red-500 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
