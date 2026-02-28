import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function SalaryManagement() {
  const { token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: null,
    month: new Date().toISOString().slice(0, 7),
    base_salary: 0,
    bonus: 0,
    deductions: 0,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      fetchSalaryRecords(selectedStaffId);
    }
  }, [selectedStaffId]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaff(data);
      if (data.length > 0) {
        setSelectedStaffId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      alert('Error loading staff: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryRecords = async (staffId) => {
    try {
      const response = await fetch(`/api/staff/staff/${staffId}/salary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch salary records');
      setSalaryRecords(await response.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/staff/salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          staff_id: selectedStaffId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create salary record');
      }

      fetchSalaryRecords(selectedStaffId);
      setShowForm(false);
      setFormData({
        staff_id: null,
        month: new Date().toISOString().slice(0, 7),
        base_salary: 0,
        bonus: 0,
        deductions: 0,
      });
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  const handleMarkPaid = async (recordId) => {
    try {
      const response = await fetch(`/api/staff/salary/${recordId}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to mark as paid');
      fetchSalaryRecords(selectedStaffId);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const selectedStaff = staff.find(s => s.id === selectedStaffId);
  const totalSalaries = salaryRecords.reduce((sum, r) => sum + (r.net_salary || 0), 0);
  const totalPaid = salaryRecords.filter(r => r.payment_status === 'completed')
    .reduce((sum, r) => sum + (r.net_salary || 0), 0);
  const totalPending = totalSalaries - totalPaid;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">💰 Salary Management</h1>

      {/* Staff Selection & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Staff Selector */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Select Staff Member</h2>
          <div className="space-y-2">
            {staff.length === 0 ? (
              <p className="text-gray-500">No staff members found</p>
            ) : (
              staff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedStaffId(member.id)}
                  className={`w-full text-left px-4 py-2 rounded transition ${
                    selectedStaffId === member.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm opacity-75">{member.role}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {selectedStaff && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="text-sm text-blue-600 font-semibold">Current Monthly Salary</div>
              <div className="text-3xl font-bold text-blue-900">₹{selectedStaff.salary?.toLocaleString()}</div>
              <div className="text-xs text-blue-700 mt-1">{selectedStaff.role} • Hired {selectedStaff.hired_date ? new Date(selectedStaff.hired_date).toLocaleDateString() : 'N/A'}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="text-xs text-green-600 font-semibold">Total Paid</div>
                <div className="text-2xl font-bold text-green-900">₹{totalPaid.toLocaleString()}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                <div className="text-xs text-red-600 font-semibold">Pending Payment</div>
                <div className="text-2xl font-bold text-red-900">₹{totalPending.toLocaleString()}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <div className="text-xs text-purple-600 font-semibold">Total Records</div>
                <div className="text-2xl font-bold text-purple-900">{salaryRecords.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Salary Record */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold"
        >
          {showForm ? '✕ Cancel' : '+ Create Salary Record'}
        </button>

        {showForm && selectedStaff && (
          <form onSubmit={handleSubmit} className="mt-6 p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Create Salary Record for {selectedStaff.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Month</label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Base Salary</label>
                <input
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({...formData, base_salary: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded"
                  step="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Bonus (₹)</label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({...formData, bonus: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Deductions (₹)</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({...formData, deductions: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded"
                  step="100"
                />
              </div>
              <div className="col-span-2 bg-blue-50 p-3 rounded border border-blue-200">
                <div className="text-sm font-semibold text-blue-900">
                  Net Salary: ₹{(formData.base_salary + formData.bonus - formData.deductions).toLocaleString()}
                </div>
              </div>
              <button
                type="submit"
                className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
              >
                Save Salary Record
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Salary Records Table */}
      {selectedStaff && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left">Month</th>
                <th className="border p-3 text-right">Base Salary</th>
                <th className="border p-3 text-right">Bonus</th>
                <th className="border p-3 text-right">Deductions</th>
                <th className="border p-3 text-right font-bold">Net Salary</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Payment Date</th>
                <th className="border p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="border p-6 text-center text-gray-500">
                    No salary records yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                salaryRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="border p-3 font-semibold">
                      {new Date(record.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="border p-3 text-right">₹{record.base_salary?.toLocaleString()}</td>
                    <td className="border p-3 text-right text-green-600">+₹{record.bonus?.toLocaleString()}</td>
                    <td className="border p-3 text-right text-red-600">-₹{record.deductions?.toLocaleString()}</td>
                    <td className="border p-3 text-right font-bold text-lg">
                      ₹{record.net_salary?.toLocaleString()}
                    </td>
                    <td className="border p-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        record.payment_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.payment_status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="border p-3 text-sm">
                      {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="border p-3 text-center">
                      {record.payment_status !== 'completed' && (
                        <button
                          onClick={() => handleMarkPaid(record.id)}
                          className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                        >
                          💳 Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
