import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Edit2, Save, X, Eye, EyeOff, Check, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../utils/api';

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

const Profile: React.FC = () => {
  console.log('Profile component loaded!');
  
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update formData when user context changes
  useEffect(() => {
    console.log('User context changed:', user);
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  }, [user]);

  // Get the correct back path based on user role
  const getBackPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'staff') return '/staff';
    if (user?.role === 'manager') return '/manager';
    return '/'; // For member role
  };

  const validateForm = (): boolean => {
    console.log('🔍 validateForm called');
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Invalid phone number format';
      isValid = false;
    }

    console.log('🔍 Validation result:', { isValid, errors });
    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if passwords match for real-time validation
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '';
  const passwordStrength = passwordData.newPassword.length >= 8;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit STARTED');
    e.preventDefault();
    
    console.log('handleSubmit called');
    
    // Check if user is authenticated and token exists
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You are not authenticated. Please login again.');
      navigate('/signin');
      return;
    }
    
    console.log('Token exists:', !!token);
    console.log('User:', user);
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending profile update request:', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });

      // Test notification first
      toast.info('Sending update request...');

      console.log('Request payload:', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });

      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      // Call API to update profile
      const response = await api.put('/api/auth/profile', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });

      console.log('Profile update response:', response.data);
      console.log('Response status:', response.status);
      console.log('Response has message:', !!response.data.message);
      console.log('Response has user:', !!response.data.user);

      // Backend returns { message: "...", user: {...} } not { success: true, ... }
      if (response.data.message && response.data.user) {
        console.log('✅ Success condition met!');
        // Exit edit mode and return to view mode
        setIsEditing(false);
        console.log('✅ isEditing set to false');
        toast.success('Profile updated successfully!');
        
        // Get updated user data from response
        const updatedUserData = response.data.user;
        console.log('Updated user data from backend:', updatedUserData);
        
        // Update user context with new data
        updateProfile({
          fullName: updatedUserData.name || updatedUserData.fullName || formData.fullName,
          email: updatedUserData.email || formData.email,
          phone: updatedUserData.phone || formData.phone
        });
        
        console.log('✅ updateProfile called with:', {
          fullName: updatedUserData.name || updatedUserData.fullName || formData.fullName,
          email: updatedUserData.email || formData.email,
          phone: updatedUserData.phone || formData.phone
        });
        
        // Clear any form errors
        setFormErrors({});
        console.log('✅ Form errors cleared');
      } else {
        console.log('❌ Success condition not met');
        console.log('Message:', response.data.message);
        console.log('User:', response.data.user);
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Profile update endpoint not found. Please contact administrator.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, updateProfile, navigate]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 handlePasswordSubmit STARTED');
    console.log('Password data:', {
      currentPassword: passwordData.currentPassword ? '***' : 'empty',
      newPassword: passwordData.newPassword ? '***' : 'empty',
      confirmPassword: passwordData.confirmPassword ? '***' : 'empty'
    });
    
    // Validate password fields
    if (!passwordData.currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordData.newPassword.trim()) {
      toast.error('New password is required');
      return;
    }

    if (!passwordStrength) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (!passwordsMatch) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Sending password change request...');
      console.log('Request payload:', {
        currentPassword: '***',
        newPassword: '***',
        confirmNewPassword: '***'
      });
      
      // Check if user is authenticated and token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You are not authenticated. Please login again.');
        navigate('/signin');
        return;
      }
      
      console.log('Token exists:', !!token);

      // Call change-password API directly
      const response = await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword
      });

      console.log('🔐 Password change response:', response.data);
      console.log('Response status:', response.status);

      // Backend returns { message: "..." } on success, not { success: true }
      if (response.data.message && response.status === 200) {
        console.log('✅ Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      } else {
        console.log('❌ Password change failed:', response.data.message);
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('🔐 Error changing password:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Current password is incorrect';
        console.log('🔐 400 error message:', errorMessage);
        toast.error(errorMessage);
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Password change endpoint not found. Please contact administrator.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
        console.log('🔐 Generic error message:', errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://i.etsystatic.com/20425521/r/il/c79b33/2968319597/il_570xN.2968319597_a6v0.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(getBackPath())}
        className="absolute top-6 left-6 z-10 flex items-center text-white hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span>Back to {user?.role === 'admin' ? 'Admin' : user?.role === 'staff' ? 'Staff' : user?.role === 'manager' ? 'Manager' : 'Home'}</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Profile Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
              <div className="w-24 h-24 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
                <User className="h-12 w-12 text-white/80" />
              </div>
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <p className="text-blue-100">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
            </div>

            {/* Profile Form */}
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={isEditing ? formData.fullName : (user?.fullName || '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        isEditing 
                          ? 'bg-white border-gray-300' 
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      } ${formErrors.fullName ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={isEditing ? formData.email : (user?.email || '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        isEditing 
                          ? 'bg-white border-gray-300' 
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      } ${formErrors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={isEditing ? formData.phone : (user?.phone || '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        isEditing 
                          ? 'bg-white border-gray-300' 
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      } ${formErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                {/* Save Changes Button - Inside form */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                )}
              </form>

              {/* Change Password Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      passwordData.newPassword !== '' 
                        ? passwordStrength 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                    required
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
                {/* Password strength indicator */}
                {passwordData.newPassword !== '' && (
                  <div className="flex items-center mt-2 text-sm">
                    {passwordStrength ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">Password is strong enough (8+ characters)</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-yellow-600">Password must be at least 8 characters</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      passwordData.confirmPassword !== '' 
                        ? passwordsMatch 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                    required
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
                {/* Password match indicator */}
                {passwordData.confirmPassword !== '' && (
                  <div className="flex items-center mt-2 text-sm">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default Profile; 