import React, { useEffect, useState } from 'react';
import { fetchBorrowers, createBorrower, updateBorrower, deleteBorrower, Borrower } from '@/lib/api';
import Dialog from '@/components/Dialog';

const BorrowerManagement: React.FC = () => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentBorrower, setCurrentBorrower] = useState<Borrower | null>(null); // For editing
  const [formData, setFormData] = useState<Omit<Borrower, 'id' | 'createdAt' | 'updatedAt'>>({
    fullName: '',
    department: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    loadBorrowers();
  }, []);

  const loadBorrowers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBorrowers();
      setBorrowers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load borrowers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (currentBorrower) {
        await updateBorrower(currentBorrower.id, formData);
      } else {
        await createBorrower(formData);
      }
      setIsFormOpen(false);
      resetForm();
      loadBorrowers(); // Reload borrowers to see the changes
    } catch (err: any) {
      setError(err.message || 'Failed to save borrower');
    }
  };

  const handleEdit = (borrower: Borrower) => {
    setCurrentBorrower(borrower);
    setFormData({
      fullName: borrower.fullName,
      department: borrower.department,
      contactEmail: borrower.contactEmail || '',
      contactPhone: borrower.contactPhone || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this borrower? This cannot be undone if there are associated records.')) {
      setError(null);
      try {
        await deleteBorrower(id);
        loadBorrowers(); // Reload borrowers
      } catch (err: any) {
        setError(err.message || 'Failed to delete borrower');
      }
    }
  };

  const resetForm = () => {
    setCurrentBorrower(null);
    setFormData({
      fullName: '',
      department: '',
      contactEmail: '',
      contactPhone: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">รายชื่อผู้ยืม</h1>
          <button
             onClick={() => { setIsFormOpen(true); resetForm(); }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            บันทึกรายชื่อผู้ยืม
          </button>
      </div>


      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ฝ่าย</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {borrowers.length === 0 && !loading && !error && (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500">No borrowers found. Add one!</td>
              </tr>
            )}
            {borrowers.map((borrower, index) => (
              <tr key={borrower.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{index+1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{borrower.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{borrower.department}</td>

                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(borrower)}
                    className="mr-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(borrower.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm(); setError(null); }}
        title={currentBorrower ? 'Edit Borrower' : 'Add New Borrower'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              name="department"
              id="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email (Optional)</label>
            <input
              type="email"
              name="contactEmail"
              id="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone (Optional)</label>
            <input
              type="text"
              name="contactPhone"
              id="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => { setIsFormOpen(false); resetForm(); setError(null); }}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition"
            >
              {currentBorrower ? 'Update Borrower' : 'Add Borrower'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default BorrowerManagement;
