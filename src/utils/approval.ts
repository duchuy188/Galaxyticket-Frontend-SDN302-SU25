import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface ApprovalRequest {
  _id: string;
  staffId: {
    _id: string;
    name: string;
  };
  managerId: {
    _id: string;
    name: string;
  } | null;
  type: 'movie' | 'promotion' | 'screening';
  requestData: any;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  referenceId: string;
  createdAt: string;
  updatedAt: string;
}


const getAuthToken = () => localStorage.getItem('token');


export const getApprovalRequests = async (
  params?: { type?: string; status?: string }
): Promise<ApprovalRequest[]> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/api/approval-requests`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching approval requests:', error);
    throw error;
  }
};


export const getApprovalRequestById = async (id: string): Promise<ApprovalRequest> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/api/approval-requests/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching approval request with id ${id}:`, error);
    throw error;
  }
};


export const updateApprovalRequest = async (
  id: string, 
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<ApprovalRequest> => {
  try {
    const token = getAuthToken();
    const response = await axios.put(
      `${API_URL}/api/approval-requests/${id}`,
      { status, rejectionReason },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating approval request with id ${id}:`, error);
    throw error;
  }
};