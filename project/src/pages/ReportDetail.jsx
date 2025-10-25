import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch report details');

      const data = await response.json();
      setReport(data);
    } catch (error) {
      toast.error('Failed to load report details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!report) {
    return <div className="min-h-screen flex items-center justify-center">Report not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to Reports
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">User Report Details</h1>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-900">{report.name}</p>
            </div>
            
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg text-gray-900">{report.email}</p>
            </div>
            
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg text-gray-900 capitalize">{report.role}</p>
            </div>
            
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="text-lg text-gray-900">
                {new Date(report.accountCreated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetail;
