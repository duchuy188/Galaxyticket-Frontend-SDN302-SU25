import React, { useState } from 'react';
import { CameraIcon } from 'lucide-react';
import QrScanner from 'react-qr-scanner';
import { checkInBooking } from '../../utils/booking';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QRScannerPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [scannerKey, setScannerKey] = useState(0);
  const [lastScannedQR, setLastScannedQR] = useState<string | null>(null);
  const [scanCooldown, setScanCooldown] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

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
      ]);
      console.log('✅ API Response:', result);
      setSuccessCount(prev => prev + 1);
      toast.success('Check-in thành công!');
    } catch (error: any) {
      console.error('❌ API Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      toast.error(error.message || 'Check-in thất bại');
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

  const handleQRScanError = (error: any) => {
    console.error('QR Scan Error:', error);
    if (!error.message?.includes("No QR code found")) {
      toast.error('Lỗi quét QR code: ' + error.message);
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
          <div className="grid grid-cols-1 gap-8">
            {/* QR Scanner Section */}
            <div>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default QRScannerPage;