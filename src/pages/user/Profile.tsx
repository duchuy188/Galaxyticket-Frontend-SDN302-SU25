import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Edit2, Camera, History, Bell, X, Eye, EyeOff, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

type TabType = 'history' | 'profile' | 'notifications';

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

const Profile: React.FC<{ hideTabs?: boolean }> = ({ hideTabs }) => {
  const { user, updateUser, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || 'https://via.placeholder.com/150',
    avatarFile: null as File | null
  });

  React.useEffect(() => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || 'https://via.placeholder.com/150',
      avatarFile: null
    });
  }, [user]);

  // Debug: Log user data when it changes
  React.useEffect(() => {
    console.log('User data updated:', user);
  }, [user]);

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
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Medium';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ tên không được để trống';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email không được để trống';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Validate phone number: không được để trống, phải đúng 10 số
    const phone = formData.phone.trim();
    if (!phone) {
      errors.phone = 'Số điện thoại không được để trống';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(phone)) {
      errors.phone = 'Số điện thoại phải đúng 10 số';
      isValid = false;
    }

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

  const handleEditClick = () => {
    if (isEditing) {
      setShowConfirmDialog(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || 'https://via.placeholder.com/150',
      avatarFile: null
    });
    setFormErrors({});
    setIsEditing(false);
    setShowConfirmDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    setIsLoading(true);
    try {
      // Tạo FormData để gửi cả text và file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      
      // Thêm avatar file nếu có
      if (formData.avatarFile) {
        formDataToSend.append('avatar', formData.avatarFile);
      }

      // Debug: Log data being sent
      console.log('Sending profile data:', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        hasAvatarFile: !!formData.avatarFile
      });

      const response = await api.put('/api/auth/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Profile update response:', response.data);
      
      // Cập nhật lại user ở FE nếu backend trả về user data
      if (response.data.user) {
        const updatedUserData = {
          fullName: response.data.user.name || response.data.user.fullName,
          email: response.data.user.email,
          phone: response.data.user.phone,
          avatar: response.data.user.avatar
        };
        
        // Update user context và localStorage
        updateUser(updatedUserData);
        
        // Update formData với avatar URL mới từ backend
        setFormData(prev => ({
          ...prev,
          avatar: response.data.user.avatar || 'https://via.placeholder.com/150',
          avatarFile: null // Reset avatarFile sau khi upload thành công
        }));
      } else {
        // Nếu backend không trả về user data, refresh từ API
        await refreshUserData();
      }
      
      setIsEditing(false);
      toast.success(response.data.message || 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      };
      const response = await api.put('/api/auth/change-password', payload);
      toast.success(response.data.message || 'Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload JPG, PNG, JPEG, or WEBP format');
        return;
      }

      // Create local preview first
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);

      // Store file for later upload when form is submitted
      setFormData(prev => ({
        ...prev,
        avatarFile: file
      }));
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await api.delete('/api/auth/profile/avatar');
      if (response.data.user) {
        // Update user context và localStorage
        updateUser({
          avatar: response.data.user.avatar
        });
        
        // Update formData với avatar URL mới từ backend
        setFormData(prev => ({
          ...prev,
          avatar: response.data.user.avatar || 'https://via.placeholder.com/150',
          avatarFile: null
        }));
      }
      toast.success(response.data.message || 'Avatar removed successfully!');
    } catch (error: any) {
      console.error('Remove avatar error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove avatar');
    }
  };

 const tabs = React.useMemo(() => {
  if (user?.role === 'member' ) {
    return [
      { id: 'history', label: 'Transaction History', icon: History },
      { id: 'profile', label: 'Personal Information', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell }
    ];
  }
  // Các role khác chỉ có tab thông tin cá nhân
  return [
    { id: 'profile', label: 'Personal Information', icon: User }
  ];
}, [user?.role]);

  const renderPasswordModal = () => {
    const passwordStrength = getPasswordStrength(passwordData.newPassword);

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <button
            onClick={() => setShowPasswordModal(false)}
            className="text-gray-400 hover:text-gray-500"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {passwordData.newPassword && (
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
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-sm mt-1 ${
                  passwordStrength < 2
                    ? 'text-red-600'
                    : passwordStrength < 3
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {getPasswordStrengthText(passwordStrength)}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password Match Indicator */}
            {passwordData.confirmPassword && (
              <div className="flex items-center mt-2 text-sm">
                {passwordData.newPassword === passwordData.confirmPassword ? (
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
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )};

  const renderConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold">Discard Changes?</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to cancel? All unsaved changes will be lost.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Keep Editing
          </button>
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 transition-all duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 transform hover:scale-105"
            title={isEditing ? "Cancel editing" : "Edit profile"}
          >
            <Edit2 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex justify-center mb-12">
          <div className="relative group">
            <img
              src={formData.avatar}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-105"
            />
            {isEditing && (
              <>
                <label 
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-all duration-300 transform hover:scale-110"
                  title="Change profile picture"
                >
                  <Camera className="w-5 h-5 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                {formData.avatar !== 'https://via.placeholder.com/150' && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-110"
                    title="Remove profile picture"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 ${
                    formErrors.fullName ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                )}
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter your phone number"
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="col-span-full group">
              <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                <input
                  type="password"
                  disabled
                  value="••••••••"
                  className="w-full pl-10 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  title="Change password"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-blue-400 disabled:transform-none"
                title="Save changes"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update</span>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      case 'history':
        return <div className="bg-white rounded-lg shadow-sm p-8">Transaction history will be displayed here</div>;
      case 'notifications':
        return <div className="bg-white rounded-lg shadow-sm p-8">Notifications will be displayed here</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button for admin profile */}
          {hideTabs && (
            <button
              onClick={() => navigate('/admin')}
              className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          )}
          {/* Tabs */}
          
      {!hideTabs && (
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center justify-center gap-2 flex-1 px-8 py-4 text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
          {/* Content */}
          {renderContent()}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && renderConfirmDialog()}

      {/* Password Change Modal */}
      {showPasswordModal && renderPasswordModal()}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Profile; 