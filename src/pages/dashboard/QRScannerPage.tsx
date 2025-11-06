import React, { useState } from 'react';
import { CameraIcon, CheckCircle, XCircle, Calendar, Clock, MapPin, Users, CreditCard, Tag, Ticket } from 'lucide-react';
import QrScanner from 'react-qr-scanner';
import { checkInBooking, getBookingById, adminGetBookings } from '../../utils/booking';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface BookingInfo {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  screeningId?: {
    _id: string;
    movieId?: {
      _id: string;
      title: string;
      poster?: string;
    };
    roomId?: {
      _id: string;
      name: string;
    };
    startTime: string;
    ticketPrice: number;
  };
  seatNumbers?: string[];
  totalPrice?: number;
  paymentStatus: string;
  paymentMethod?: string;
  promotionId?: string;
  discountAmount?: number;
  code?: string;
  emailSent?: boolean;
  checkInStatus: string;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
  updatedAt: string;
  theaterName?: string;  // Thêm tên rạp
}

const QRScannerPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [scannerKey, setScannerKey] = useState(0);
  const [lastScannedQR, setLastScannedQR] = useState<string | null>(null);
  const [scanCooldown, setScanCooldown] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);

  const handleQRScanSuccess = async (qrData: string | null) => {
    if (!qrData) return;
    
    // Ngăn spam - kiểm tra QR code trùng lặp
    if (lastScannedQR === qrData) {
      console.log('🚫 Duplicate QR code detected, ignoring...');
      return;
    }
    
    // Ngăn spam - kiểm tra cooldown
    if (scanCooldown || isLoading) {
      console.log('🚫 Scan cooldown active, ignoring...');
      return;
    }
    
    console.log('🔍 QR Code detected:', qrData);
    setScanCount(prev => prev + 1);
    
    try {
      setIsLoading(true);
      setScanCooldown(true);
      setLastScannedQR(qrData);
      
      console.log('📡 Calling API...');
      console.log('📡 API URL:', '/api/bookings/check-in');
      console.log('📡 Request data:', { qrData });
      
      const result = await Promise.race([
        checkInBooking(qrData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout after 10 seconds')), 10000)
        )
      ]) as { success: boolean; data?: BookingInfo; booking?: BookingInfo };
      console.log('✅ API Response:', result);
      console.log('✅ Result data:', result.data);
      console.log('✅ Result booking:', result.booking);
      console.log('✅ Result success:', result.success);
      
      // Lưu thông tin vé - backend có thể trả về data hoặc booking
      const bookingData = result.data || result.booking;
      if (result.success && bookingData) {
        console.log('💾 Saving booking info:', bookingData);
        
        // Lấy bookingId (có thể là _id hoặc bookingId)
        const bookingId = bookingData._id || (bookingData as {bookingId?: string}).bookingId;
        
        if (bookingId) {
          try {
            console.log('🔍 Fetching full booking details for ID:', bookingId);
            
            // Thử gọi adminGetBookings trước
            try {
              console.log('🔍 Trying adminGetBookings...');
              const adminResult = await adminGetBookings({ });
              console.log('📦 Admin bookings result:', adminResult);
              
              // Tìm booking theo ID
              const foundBooking = adminResult.bookings?.find((b: { _id: string }) => b._id === bookingId);
              if (foundBooking) {
                console.log('✅ Found booking via adminGetBookings:', foundBooking);
                setBookingInfo(foundBooking as unknown as BookingInfo);
                return; // Dừng tại đây nếu tìm thấy
              }
            } catch (adminError) {
              console.warn('⚠️ adminGetBookings failed, trying getBookingById...');
            }
            
            // Fallback: thử getBookingById
            const fullBookingData = await getBookingById(bookingId);
            console.log('📦 Full booking data from getBookingById:', fullBookingData);
            setBookingInfo(fullBookingData as unknown as BookingInfo);
          } catch (fetchError) {
            console.warn('⚠️ Could not fetch full booking details, using partial data');
            console.log('📊 Available fields:', Object.keys(bookingData));
            console.log('📊 Full bookingData:', bookingData);
            
            // Cast to any để access các field không có trong interface
            const data = bookingData as Record<string, unknown> & BookingInfo;
            
            // Fallback: Map dữ liệu từ response sang cấu trúc UI expect
            const mappedBooking: BookingInfo = {
              _id: bookingId,
              checkInStatus: data.checkInStatus || 'checked_in',
              checkedInAt: data.checkedInAt || new Date().toISOString(),
              totalPrice: (data.totalPrice as number) || (data.amount as number) || (data.price as number) || 0,
              paymentStatus: data.paymentStatus || 'paid',
              paymentMethod: data.paymentMethod,
              code: data.code,
              discountAmount: (data.discountAmount as number) || (data.discount as number) || 0,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              seatNumbers: data.seatNumbers || [],
              theaterName: (data.theaterName as string),  // Thêm tên rạp
              // Map thông tin nested từ flat data
              userId: data.userId || {
                _id: (data.customerId as string) || '',
                name: (data.customerName as string) || 'N/A',
                email: (data.customerEmail as string) || 'N/A'
              },
              screeningId: {
                _id: (typeof data.screeningId === 'string' ? data.screeningId : data.screeningId?._id) || '',
                startTime: (data.screeningTime as string) || new Date().toISOString(),
                ticketPrice: (data.ticketPrice as number) || 0,
                movieId: {
                  _id: (data.movieId as string) || '',
                  title: (data.movieTitle as string) || 'N/A',
                  poster: (data.moviePoster as string)
                },
                roomId: {
                  _id: (data.roomId as string) || '',
                  name: (data.roomName as string) || 'N/A'
                }
              }
            };
            console.log('� Mapped booking info:', mappedBooking);
            setBookingInfo(mappedBooking);
          }
        } else {
          console.error('❌ No booking ID found in response');
        }
      } else {
        console.warn('⚠️ No data in result or success is false');
        console.warn('⚠️ Full result object:', JSON.stringify(result, null, 2));
      }
      
      setSuccessCount(prev => prev + 1);
      toast.success('Check-in thành công!');
    } catch (error: unknown) {
      const err = error as { 
        message?: string; 
        data?: BookingInfo;
        success?: boolean;
        response?: { 
          data?: unknown; 
          status?: number; 
          statusText?: string 
        } 
      };
      console.error('❌ API Error:', error);
      console.error('❌ Error details:', {
        message: err.message,
        data: err.data,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      // Nếu có dữ liệu booking trong lỗi (ví dụ: vé đã check-in), vẫn hiển thị thông tin
      if (err.data) {
        setBookingInfo(err.data);
      } else {
        setBookingInfo(null);
      }
      
      toast.error(err.message || 'Check-in thất bại');
    } finally {
      setIsLoading(false);
      // Reset scanner và cooldown sau 3 giây
      setTimeout(() => {
        console.log('🔄 Scanner reset - ready for next QR code');
        setScannerKey(prev => prev + 1); // Force re-render scanner
        setScanCooldown(false); // Reset cooldown
        setLastScannedQR(null); // Reset last scanned QR
      }, 3000);
    }
  };

  const handleQRScanError = (error: unknown) => {
    const err = error as { message?: string };
    console.error('QR Scan Error:', error);
    if (!err.message?.includes("No QR code found")) {
      toast.error('Lỗi quét QR code: ' + err.message);
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setIsScanning(true);
      toast.success('Camera đã sẵn sàng!');
    } catch (error) {
      setCameraPermission('denied');
      toast.error('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const resetStatistics = () => {
    setScanCount(0);
    setSuccessCount(0);
    setLastScannedQR(null);
    setScanCooldown(false);
    toast.info('Đã reset thống kê');
  };

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
        toastStyle={{ zIndex: 9999 }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Check-in QR Code
                  </h1>
                  <p className="text-gray-600 mt-1">Quét QR code trên vé để check-in khách hàng</p>
                  {scanCount > 0 && (
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>📊 Đã quét: {scanCount} | ✅ Thành công: {successCount}</span>
                      <button
                        onClick={resetStatistics}
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QR Scanner Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                {isLoading && (
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm font-medium">Đang xử lý...</span>
                    </div>
                  </div>
                )}
                
                {!isScanning ? (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CameraIcon size={40} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Sẵn sàng quét QR Code
                      </h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Nhấn nút bên dưới để kích hoạt camera và bắt đầu quét QR code trên vé của khách hàng
                      </p>
                    </div>
                    
                    <button
                      onClick={startScanning}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <CameraIcon size={20} />
                        <span>Bắt đầu quét QR</span>
                      </div>
                    </button>
                    
                    {cameraPermission === 'denied' && (
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-red-800 mb-2">
                              Camera bị từ chối
                            </p>
                            <ul className="text-xs text-red-600 space-y-1">
                              <li>• Kiểm tra cài đặt quyền camera của trình duyệt</li>
                              <li>• Đảm bảo đang sử dụng HTTPS</li>
                              <li>• Thử refresh trang và cho phép camera</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Status indicators on top */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Đang quét</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <CameraIcon size={16} />
                          <span className="text-sm">Camera</span>
                        </div>
                        {scanCooldown && (
                          <div className="flex items-center space-x-2 text-orange-600">
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Cooldown 3s</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={stopScanning}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                      >
                        Dừng quét
                      </button>
                    </div>

                    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative">
                      <QrScanner
                        key={scannerKey}
                        delay={300}
                        onError={handleQRScanError}
                        onScan={handleQRScanSuccess}
                        style={{
                          width: '100%',
                          height: '400px',
                        }}
                      />
                      
                      {/* QR Focus Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-64 h-64">
                          {/* Top-left corner */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-500 rounded-tl-lg shadow-lg shadow-blue-500/50"></div>
                          {/* Top-right corner */}
                          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-500 rounded-tr-lg shadow-lg shadow-blue-500/50"></div>
                          {/* Bottom-left corner */}
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-500 rounded-bl-lg shadow-lg shadow-blue-500/50"></div>
                          {/* Bottom-right corner */}
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-500 rounded-br-lg shadow-lg shadow-blue-500/50"></div>
                          
                          {/* Scanning line animation */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-blue-500 scan-line"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800 text-center">
                        <CameraIcon size={16} className="inline mr-2" />
                        Đưa camera lên QR code trên vé của khách hàng
                      </p>
                      {/* Tạm thời comment out QR display để debug */}
                      {/* {lastScannedQR && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">QR Code vừa quét:</p>
                          <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                            {lastScannedQR}
                          </p>
                        </div>
                      )} */}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Information Section */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Ticket className="mr-2 text-blue-600" size={24} />
                  Thông tin vé
                </h2>
                
                {bookingInfo ? (
                  <div className="space-y-4">
                    {/* Check-in Status */}
                    <div className={`p-4 rounded-xl ${
                      bookingInfo.checkInStatus === 'checked_in' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
                        <span className={`flex items-center text-sm font-semibold ${
                          bookingInfo.checkInStatus === 'checked_in' ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          {bookingInfo.checkInStatus === 'checked_in' ? (
                            <>
                              <CheckCircle size={16} className="mr-1" />
                              Đã check-in
                            </>
                          ) : (
                            <>
                              <XCircle size={16} className="mr-1" />
                              Chưa check-in
                            </>
                          )}
                        </span>
                      </div>
                      {bookingInfo.checkedInAt && (
                        <div className="mt-2 text-xs text-gray-600">
                          <Clock size={12} className="inline mr-1" />
                          {new Date(bookingInfo.checkedInAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="border-b border-gray-200 pb-4">
                      {bookingInfo.screeningId?.movieId?.poster && (
                        <img 
                          src={bookingInfo.screeningId.movieId.poster} 
                          alt={bookingInfo.screeningId.movieId.title}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {bookingInfo.screeningId?.movieId?.title || 'N/A'}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <Calendar size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {bookingInfo.screeningId?.startTime ? new Date(bookingInfo.screeningId.startTime).toLocaleDateString('vi-VN', { 
                              weekday: 'long',
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Clock size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {bookingInfo.screeningId?.startTime ? new Date(bookingInfo.screeningId.startTime).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            }) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <MapPin size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-gray-700">
                            <div>{bookingInfo.screeningId?.roomId?.name || 'N/A'}</div>
                            {bookingInfo.theaterName && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Rạp: {bookingInfo.theaterName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center">
                        <Users size={16} className="mr-2 text-blue-600" />
                        Khách hàng
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">{bookingInfo.userId?.name || 'N/A'}</p>
                        {bookingInfo.userId?.email && bookingInfo.userId.email !== 'N/A' && (
                          <p className="text-gray-600 text-xs">{bookingInfo.userId.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Seat Info */}
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Ghế ngồi</h4>
                      <div className="flex flex-wrap gap-2">
                        {bookingInfo.seatNumbers?.map((seat, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                          >
                            {seat}
                          </span>
                        )) || <span className="text-gray-500 text-sm">N/A</span>}
                      </div>
                    </div>

                    {/* Booking ID */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-500">
                        Mã đặt vé: <span className="font-mono">{bookingInfo._id}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Quét QR code để xem thông tin vé
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRScannerPage;