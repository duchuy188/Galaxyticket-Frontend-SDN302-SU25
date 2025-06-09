import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowUpIcon,
} from 'lucide-react'
// Mock data for requests
const mockRequests = {
  movies: [
    {
      id: '1',
      type: 'movie',
      action: 'add',
      status: 'pending',
      date: '2023-11-15',
      requestedBy: 'Staff User',
      details: {
        title: 'The Matrix Resurrections',
        genre: 'Sci-Fi',
        duration: '148 min',
      },
    },
    {
      id: '2',
      type: 'movie',
      action: 'edit',
      status: 'approved',
      date: '2023-11-14',
      requestedBy: 'Staff User',
      details: {
        title: 'Inception',
        changes: ['Updated description', 'Changed release date'],
      },
    },
  ],
  promotions: [
    {
      id: '3',
      type: 'promotion',
      action: 'add',
      status: 'pending',
      date: '2023-11-15',
      requestedBy: 'Staff User',
      details: {
        name: 'Holiday Special',
        discount: '20%',
        validUntil: '2023-12-31',
      },
    },
  ],
  showtimes: [
    {
      id: '4',
      type: 'showtime',
      action: 'cancel',
      status: 'pending',
      date: '2023-11-15',
      requestedBy: 'Staff User',
      details: {
        movie: 'Inception',
        datetime: '2023-11-20 15:30',
        reason: 'Technical maintenance',
      },
    },
  ],
  seatMaps: [
    {
      id: '5',
      type: 'seatMap',
      action: 'edit',
      status: 'rejected',
      date: '2023-11-14',
      requestedBy: 'Staff User',
      details: {
        theater: 'Theater 1',
        changes: ['Blocked seats A1-A3 for maintenance'],
      },
    },
  ],
}
type Request = {
  id: string
  type: string
  action: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
  requestedBy: string
  details: any
}
type RequestDetailModalProps = {
  request: Request | null
  onClose: () => void
  onApprove: (id: string, comment: string) => void
  onReject: (id: string, comment: string) => void
}
const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject,
}) => {
  const [comment, setComment] = useState('')
  if (!request) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">Request Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XCircleIcon size={24} />
            </button>
          </div>
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">
                  {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Action</p>
                <p className="font-medium">
                  {request.action.charAt(0).toUpperCase() +
                    request.action.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requested By</p>
                <p className="font-medium">{request.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{request.date}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Details</p>
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(request.details).map(([key, value]) => (
                  <div key={key} className="mb-2 last:mb-0">
                    <span className="font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:{' '}
                    </span>
                    <span>
                      {Array.isArray(value)
                        ? value.join(', ')
                        : value.toString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                onReject(request.id, comment)
                onClose()
              }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            >
              Reject
            </button>
            <button
              onClick={() => {
                onApprove(request.id, comment)
                onClose()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
const ApprovalList: React.FC<{
  requests: Request[]
  onViewRequest: (request: Request) => void
}> = ({ requests, onViewRequest }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Action
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Requested By
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {request.action.charAt(0).toUpperCase() +
                    request.action.slice(1)}
                </div>
                <div className="text-sm text-gray-500">
                  {Object.values(request.details)[0]?.toString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request.requestedBy}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewRequest(request)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EyeIcon size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
const ManagerDashboard: React.FC = () => {
  const location = useLocation()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [requests, setRequests] = useState(mockRequests)
  // Check which section we're on
  const isMainDashboard = location.pathname === '/manager'
  const isMovieRequests = location.pathname === '/manager/movies'
  const isPromotionRequests = location.pathname === '/manager/promotions'
  const isShowtimeRequests = location.pathname === '/manager/showtimes'
  const isSeatMapRequests = location.pathname === '/manager/seatmaps'
  const handleApprove = (id: string, comment: string) => {
    // Update request status
    const newRequests = {
      ...requests,
    }
    Object.keys(newRequests).forEach((key) => {
      const typedKey = key as keyof typeof requests
      newRequests[typedKey] = newRequests[typedKey].map((request) =>
        request.id === id
          ? {
              ...request,
              status: 'approved',
            }
          : request,
      )
    })
    setRequests(newRequests)
  }
  const handleReject = (id: string, comment: string) => {
    // Update request status
    const newRequests = {
      ...requests,
    }
    Object.keys(newRequests).forEach((key) => {
      const typedKey = key as keyof typeof requests
      newRequests[typedKey] = newRequests[typedKey].map((request) =>
        request.id === id
          ? {
              ...request,
              status: 'rejected',
            }
          : request,
      )
    })
    setRequests(newRequests)
  }
  const getPendingCount = (type: keyof typeof requests) => {
    return requests[type].filter((request) => request.status === 'pending')
      .length
  }
  const renderMainDashboard = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Movie Requests</h3>
          <p className="text-3xl font-bold">{getPendingCount('movies')}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon size={16} className="mr-1" />
              New requests
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Promotion Requests</h3>
          <p className="text-3xl font-bold">{getPendingCount('promotions')}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon size={16} className="mr-1" />
              Pending review
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Showtime Requests</h3>
          <p className="text-3xl font-bold">{getPendingCount('showtimes')}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon size={16} className="mr-1" />
              Needs attention
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Seat Map Changes</h3>
          <p className="text-3xl font-bold">{getPendingCount('seatMaps')}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon size={16} className="mr-1" />
              Layout updates
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
        <ApprovalList
          requests={[
            ...requests.movies,
            ...requests.promotions,
            ...requests.showtimes,
            ...requests.seatMaps,
          ]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .slice(0, 5)}
          onViewRequest={setSelectedRequest}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Movies</h3>
          <ApprovalList
            requests={requests.movies.filter((r) => r.status === 'pending')}
            onViewRequest={setSelectedRequest}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Promotions</h3>
          <ApprovalList
            requests={requests.promotions.filter((r) => r.status === 'pending')}
            onViewRequest={setSelectedRequest}
          />
        </div>
      </div>
    </div>
  )
  const renderRequestSection = (type: keyof typeof requests, title: string) => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage {type} requests
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
            All
          </button>
          <button className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100">
            Pending
          </button>
          <button className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100">
            Approved
          </button>
          <button className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100">
            Rejected
          </button>
        </div>
        <ApprovalList
          requests={requests[type]}
          onViewRequest={setSelectedRequest}
        />
      </div>
    </div>
  )
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      {isMainDashboard && renderMainDashboard()}
      {isMovieRequests && renderRequestSection('movies', 'Movie Requests')}
      {isPromotionRequests &&
        renderRequestSection('promotions', 'Promotion Requests')}
      {isShowtimeRequests &&
        renderRequestSection('showtimes', 'Showtime Requests')}
      {isSeatMapRequests &&
        renderRequestSection('seatMaps', 'Seat Map Requests')}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
export default ManagerDashboard
