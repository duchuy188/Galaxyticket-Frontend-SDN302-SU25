import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusIcon, MapPinIcon } from 'lucide-react';
import { getTheaters, createTheater, updateTheater, deleteTheater, Theater } from '../../utils/theater';

const TheaterManagement: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [editingTheater, setEditingTheater] = useState<Partial<Theater> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [theaterToDelete, setTheaterToDelete] = useState<Theater | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      setIsLoading(true);
      const data = await getTheaters();
      setTheaters(data);
    } catch (err) {
      setError('Failed to fetch theaters');
      toast.error('Failed to fetch theaters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTheater = () => {
    setEditingTheater({
      name: '',
      address: '',
      phone: '',
      description: '',
      status: true
    });
  };

  const handleEditTheater = (theater: Theater) => {
    setEditingTheater({ ...theater });
  };

  const handleDeleteClick = (theater: Theater) => {
    setTheaterToDelete(theater);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!theaterToDelete) return;
    try {
      setIsLoading(true);
      await deleteTheater(theaterToDelete._id);
      await fetchTheaters();
      toast.success('Xóa rạp thành công!');
    } catch (err) {
      toast.error('Không thể xóa rạp');
      console.error('Error deleting theater:', err);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setTheaterToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTheaterToDelete(null);
  };

  const handleSaveTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheater) return;

    try {
      setIsLoading(true);

      if (editingTheater._id) {
        // Update existing theater
        const updatedTheater = await updateTheater(editingTheater._id, editingTheater);
        setTheaters(theaters.map(theater => 
          theater._id === updatedTheater._id ? updatedTheater : theater
        ));
        toast.success('Cập nhật rạp thành công!');
      } else {
        // Create new theater
        const newTheater = await createTheater(editingTheater as any);
        setTheaters([...theaters, newTheater]);
        toast.success('Thêm rạp mới thành công!');
      }
      
      setEditingTheater(null);
    } catch (err) {
      console.error('Error saving theater:', err);
      toast.error('Có lỗi xảy ra khi lưu thông tin rạp');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản Lý Rạp Chiếu Phim</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleAddTheater}
          disabled={isLoading}
        >
          <PlusIcon size={18} className="mr-1" />
          Thêm Rạp Mới
        </button>
      </div>

      {isLoading && !editingTheater && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="showInactive"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={showInactive}
          onChange={e => setShowInactive(e.target.checked)}
        />
        <label htmlFor="showInactive" className="ml-2 text-sm text-gray-700">
          Hiển thị rạp tạm đóng
        </label>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Rạp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Địa Chỉ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số Điện Thoại
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {theaters
              .filter(theater => showInactive || theater.status)
              .map(theater => (
                <tr key={theater._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPinIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {theater.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{theater.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{theater.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${theater.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {theater.status ? 'Hoạt Động' : 'Tạm Đóng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEditTheater(theater)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteClick(theater)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            
            {theaters.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Không có rạp nào. Hãy thêm rạp mới!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Theater Modal */}
      {editingTheater && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingTheater._id ? 'Chỉnh Sửa Rạp' : 'Thêm Rạp Mới'}
                </h3>
                <button 
                  onClick={() => !isLoading && setEditingTheater(null)}
                  className={`text-gray-400 hover:text-gray-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveTheater} className="space-y-6 relative">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên Rạp <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editingTheater.name || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        name: e.target.value
                      })} 
                      required 
                      minLength={2}
                      maxLength={100}
                      placeholder="Ví dụ: Galaxy Cinema Nguyễn Văn Quá"
                    />
                    <p className="text-xs text-gray-500 mt-1">2-100 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa Chỉ <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editingTheater.address || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        address: e.target.value
                      })} 
                      required 
                      minLength={10}
                      maxLength={200}
                      placeholder="Ví dụ: 119B Nguyễn Văn Quá, Phường Đông Hưng Thuận, Q.12"
                    />
                    <p className="text-xs text-gray-500 mt-1">10-200 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số Điện Thoại <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editingTheater.phone || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        phone: e.target.value
                      })} 
                      required 
                      pattern="^[0-9\s]{4,10}$"
                      title="Vui lòng nhập 4-10 số"
                      placeholder="Ví dụ: 19002224"
                    />
                    <p className="text-xs text-gray-500 mt-1">4-10 số</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng Thái
                    </label>
                    <div className="mt-1">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md ${
                          editingTheater.status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => setEditingTheater({
                          ...editingTheater,
                          status: true
                        })}
                      >
                        Hoạt Động
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md ml-2 ${
                          !editingTheater.status 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                        onClick={() => setEditingTheater({
                          ...editingTheater,
                          status: false
                        })}
                      >
                        Tạm Đóng
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô Tả <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={5}
                      value={editingTheater.description || ''} 
                      onChange={e => setEditingTheater({
                        ...editingTheater,
                        description: e.target.value
                      })}
                      required
                      minLength={50}
                      maxLength={2000}
                      placeholder="Mô tả chi tiết về rạp chiếu phim..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">50-2000 ký tự</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t mt-8">
                  <button 
                    type="button" 
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={() => setEditingTheater(null)}
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="relative px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="opacity-0">{editingTheater._id ? 'Cập Nhật' : 'Thêm Mới'}</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      </>
                    ) : (
                      editingTheater._id ? 'Cập Nhật' : 'Thêm Mới'
                    )}
                  </button>
                </div>

                {/* Overlay when loading */}
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-40 pointer-events-auto cursor-not-allowed z-10" />
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && theaterToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Xác nhận xóa rạp</h3>
            <p className="mb-6 text-gray-700">Bạn có chắc muốn xóa rạp <span className="font-semibold">{theaterToDelete.name}</span>?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={handleCancelDelete}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterManagement;