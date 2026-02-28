import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function StaffManagement() {
  const { token, restaurantInfo } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    salary: 0,
    hired_date: new Date().toISOString().split('T')[0],
  });
  const [tempCreds, setTempCreds] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch staff');
      setStaff(await response.json());
    } catch (err) {
      console.error(err);
      alert('Error loading staff: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `/api/staff/staff/${editingId}` 
        : '/api/staff/staff';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save staff');
      }

      const result = await response.json();
      
      if (method === 'POST') {
        // Show temporary credentials
        setTempCreds(result);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'waiter',
        salary: 0,
        hired_date: new Date().toISOString().split('T')[0],
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      salary: member.salary,
      hired_date: member.hired_date?.split('T')[0]
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this staff member?')) return;
    try {
      const response = await fetch(`/api/staff/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchStaff();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading staff...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">👥 Staff Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (!showForm) setTempCreds(null);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? '✕ Cancel' : '+ Add Staff Member'}
        </button>
      </div>

      {/* Temporary Credentials Alert */}
      {tempCreds && (
        <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded">
          <h3 className="font-bold text-green-800 mb-2">✓ Staff Account Created</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Username:</strong> <code className="bg-green-50 px-2 py-1 rounded">{tempCreds.username}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(tempCreds.username)}
                className="ml-2 text-green-600 hover:text-green-800 text-xs"
              >
                📋 Copy
              </button>
            </div>
            <div>
              <strong>Temporary Password:</strong> <code className="bg-green-50 px-2 py-1 rounded">{tempCreds.tempPassword}</code>
              <button 
                onClick={() => navigator.clipboard.writeText(tempCreds.tempPassword)}
                className="ml-2 text-green-600 hover:text-green-800 text-xs"
              >
                📋 Copy
              </button>
            </div>
          </div>
          <p className="text-xs text-green-700 mt-3">⚠️ {tempCreds.message}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-2 px-3 py-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="px-3 py-2 border rounded"
            >
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="manager">Manager</option>
            </select>
            <input
              type="number"
              placeholder="Monthly Salary"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: parseFloat(e.target.value)})}
              className="px-3 py-2 border rounded"
              step="100"
              min="0"
            />
            <input
              type="date"
              value={formData.hired_date}
              onChange={(e) => setFormData({...formData, hired_date: e.target.value})}
              className="px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="col-span-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
            >
              {editingId ? 'Update Staff Member' : 'Create Staff & Generate Credentials'}
            </button>
          </form>
        </div>
      )}

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-right">Salary</th>
              <th className="border p-2 text-left">Hired Date</th>
              <th className="border p-2 text-center">Status</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="8" className="border p-4 text-center text-gray-500">
                  No staff members yet. Add one to get started.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="border p-2 font-semibold">{member.name}</td>
                  <td className="border p-2 text-sm">{member.email}</td>
                  <td className="border p-2 text-sm">{member.phone || '—'}</td>
                  <td className="border p-2"><span className="bg-blue-100 px-2 py-1 rounded text-sm">{member.role}</span></td>
                  <td className="border p-2 text-right">₹{member.salary?.toLocaleString()}</td>
                  <td className="border p-2 text-sm">
                    {member.hired_date ? new Date(member.hired_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="border p-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      🗑️ Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
