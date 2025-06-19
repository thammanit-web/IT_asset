import React, { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  fetchBorrowingRecords, createBorrowingRecord, updateBorrowingRecord, deleteBorrowingRecord,
  fetchAssets, fetchBorrowers, Asset, Borrower, BorrowingRecordWithRelations
} from '@/lib/api';
import Dialog from '@/components/Dialog';

type SortKeys = keyof BorrowingRecordWithRelations | 'assetName' | 'borrowerName' | 'borrowDate' | 'status'; // Add specific keys for sorting nested properties
type SortDirection = 'asc' | 'desc';

const BorrowingRecordManagement: React.FC = () => {
  const [records, setRecords] = useState<BorrowingRecordWithRelations[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]); // For dropdowns
  const [borrowers, setBorrowers] = useState<Borrower[]>([]); // For dropdowns
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBorrowFormOpen, setIsBorrowFormOpen] = useState<boolean>(false);
  const [isReturnConfirmOpen, setIsReturnConfirmOpen] = useState<boolean>(false);
  const [selectedRecordToReturn, setSelectedRecordToReturn] = useState<BorrowingRecordWithRelations | null>(null);

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKeys>('borrowDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [borrowFormData, setBorrowFormData] = useState({
    assetId: '',
    borrowerId: '',
    expectedReturnDate: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recordsData, assetsData, borrowersData] = await Promise.all([
        fetchBorrowingRecords(),
        fetchAssets({ all: true }),
        fetchBorrowers(),
      ]);
      setRecords(recordsData);
      setAssets(assetsData);
      setBorrowers(borrowersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowFormChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setBorrowFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const newRecord = await createBorrowingRecord({
        assetId: parseInt(borrowFormData.assetId),
        borrowerId: parseInt(borrowFormData.borrowerId),
        expectedReturnDate: borrowFormData.expectedReturnDate || undefined,
        notes: borrowFormData.notes || undefined,
      });
      setIsBorrowFormOpen(false);
      resetBorrowForm();
      loadData(); // Reload all data to update lists and asset statuses
    } catch (err: any) {
      setError(err.message || 'Failed to create borrowing record');
    }
  };

  const handleReturnClick = (record: BorrowingRecordWithRelations) => {
    setSelectedRecordToReturn(record);
    setIsReturnConfirmOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedRecordToReturn) return;
    setError(null);
    try {
      await updateBorrowingRecord(selectedRecordToReturn.id, {
        status: 'คืนแล้ว',
        returnDate: new Date().toISOString(), // Set current date as actual return date
      });
      setIsReturnConfirmOpen(false);
      setSelectedRecordToReturn(null);
      loadData(); // Reload data
    } catch (err: any) {
      setError(err.message || 'Failed to mark as returned');
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this borrowing record? This action cannot be undone.')) {
      setError(null);
      try {
        await deleteBorrowingRecord(id);
        loadData();
      } catch (err: any) {
        setError(err.message || 'Failed to delete record');
      }
    }
  }

  const resetBorrowForm = () => {
    setBorrowFormData({
      assetId: '',
      borrowerId: '',
      expectedReturnDate: '',
      notes: '',
    });
  };

  const exportToExcel = () => {
    // Prepare data for Excel export
    const excelData = records.map((record, index) => ({
      'ลำดับ': index + 1,
      'รหัสครุภัณฑ์': record.asset?.assetID || 'N/A',
      'ชื่อครุภัณฑ์': record.asset?.assetName || 'N/A',
      'ประเภทครุภัณฑ์': record.asset?.groupType || 'N/A',
      'ชื่อผู้ยืม': record.borrower?.fullName || 'N/A',
      'แผนก': record.borrower?.department || 'N/A',
      'หมายเลขติดต่อ': record.borrower?.contactPhone || 'N/A',
      'วันที่ยืม': new Date(record.borrowDate).toLocaleDateString('th-TH'),
      'วันที่คืน': record.returnDate
        ? new Date(record.returnDate).toLocaleDateString('th-TH')
        : 'ยังไม่คืน',
      'สถานะ': record.status,
      'หมายเหตุ': record.notes || 'ไม่มี',
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 8 },    // ลำดับ
      { wch: 15 },   // รหัสครุภัณฑ์
      { wch: 25 },   // ชื่อครุภัณฑ์
      { wch: 15 },   // ประเภทครุภัณฑ์
      { wch: 20 },   // ชื่อผู้ยืม
      { wch: 15 },   // แผนก
      { wch: 15 },   // หมายเลขติดต่อ
      { wch: 15 },   // วันที่ยืม
      { wch: 18 },   // วันที่คืน (คาดหวัง) - this was missing in original export but is now added.
      { wch: 15 },   // สถานะ
      { wch: 20 },   // หมายเหตุ
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'บันทึกการยืมครุภัณฑ์');

    // Generate filename with current date
    const currentDate = new Date().toLocaleDateString('th-TH').replace(/\//g, '-');
    const filename = `บันทึกการยืมครุภัณฑ์_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  // --- Sorting Logic ---
  const sortData = (key: SortKeys) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    const sortableItems = [...records];
    if (sortableItems.length > 0) {
      sortableItems.sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortKey) {
          case 'assetName':
            valA = a.asset?.assetName || '';
            valB = b.asset?.assetName || '';
            break;
          case 'borrowerName':
            valA = a.borrower?.fullName || '';
            valB = b.borrower?.fullName || '';
            break;
          case 'borrowDate':
            valA = new Date(a.borrowDate).getTime();
            valB = new Date(b.borrowDate).getTime();
            break;
          case 'returnDate':
            // Handle null/undefined return dates gracefully for sorting
            valA = a.returnDate ? new Date(a.returnDate).getTime() : -Infinity; // Returned items first
            valB = b.returnDate ? new Date(b.returnDate).getTime() : -Infinity;
            break;
          case 'status':
            valA = a.status;
            valB = b.status;
            break;
          default:
            // Fallback for direct properties, though not used in this example
            valA = (a as any)[sortKey];
            valB = (b as any)[sortKey];
            break;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return sortDirection === 'asc' ? (valA - valB) : (valB - valA);
        }
      });
    }
    return sortableItems;
  }, [records, sortKey, sortDirection]);
  // --- End Sorting Logic ---

  const getSortIcon = (key: SortKeys) => {
    if (sortKey === key) {
      return sortDirection === 'asc' ? (
        <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="ml-1 h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.707a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">บันทึกการยืมครุภัณฑ์</h1>

        <div className="flex space-x-3">
          <button
            onClick={exportToExcel}
            disabled={records.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>

          <button
            onClick={() => { setIsBorrowFormOpen(true); resetBorrowForm(); }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            บันทึกการยืมครุภัณฑ์
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      )}

      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => sortData('assetName')}
                >
                  <div className="flex items-center">
                    ชื่อครุภัณฑ์
                    {getSortIcon('assetName')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => sortData('borrowerName')}
                >
                  <div className="flex items-center">
                    ชื่อผู้ยืม
                    {getSortIcon('borrowerName')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => sortData('borrowDate')}
                >
                  <div className="flex items-center">
                    วันที่ยืม
                    {getSortIcon('borrowDate')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => sortData('returnDate')}
                >
                  <div className="flex items-center">
                    วันที่คืน
                    {getSortIcon('returnDate')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => sortData('status')}
                >
                  <div className="flex items-center">
                    สถานะ
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRecords.length === 0 && !loading && !error ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>ไม่พบข้อมูลการยืมครุภัณฑ์</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.asset?.assetName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">({record.asset?.assetID || 'N/A'})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.borrower?.fullName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">({record.borrower?.department || 'N/A'})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.borrowDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.returnDate ? new Date(record.returnDate).toLocaleDateString('th-TH') : 'รอการคืน'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'ยืม' ? 'bg-orange-100 text-orange-800' :
                          record.status === 'คืนแล้ว' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {record.status === 'ยืม' && (
                          <button
                            onClick={() => handleReturnClick(record)}
                            className="inline-flex items-center px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors duration-150"
                          >
                            คืนแล้ว
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors duration-150"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrow Item Dialog */}
      <Dialog
        isOpen={isBorrowFormOpen}
        onClose={() => { setIsBorrowFormOpen(false); resetBorrowForm(); setError(null); }}
        title="บันทึกการยืมครุภัณฑ์"
      >
        <form onSubmit={handleBorrowSubmit} className="space-y-4">
          <div>
            <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">เลือกครุภัณฑ์</label>
            <select
              name="assetId"
              id="assetId"
              value={borrowFormData.assetId}
              onChange={handleBorrowFormChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- เลือกครุภัณฑ์ --</option>
              {assets.filter(asset => asset.status === 'ใช้งาน').map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetName} ({asset.assetID}) - {asset.status}
                </option>
              ))}
            </select>
            {assets.filter(asset => asset.status === 'ใช้งาน').length === 0 && (
              <p className="text-sm text-red-500 mt-1">ไม่มีครุภัณฑ์ที่พร้อมใช้งาน</p>
            )}
          </div>
          <div>
            <label htmlFor="borrowerId" className="block text-sm font-medium text-gray-700 mb-1">เลือกผู้ยืม</label>
            <select
              name="borrowerId"
              id="borrowerId"
              value={borrowFormData.borrowerId}
              onChange={handleBorrowFormChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- เลือกผู้ที่ต้องการยืม --</option>
              {borrowers.map((borrower) => (
                <option key={borrower.id} value={borrower.id}>
                  {borrower.fullName} ({borrower.department})
                </option>
              ))}
            </select>
            {borrowers.length === 0 && (
              <p className="text-sm text-red-500 mt-1">ไม่มีข้อมูลผู้ยืม กรุณาเพิ่มผู้ยืมก่อน</p>
            )}
          </div>
          <div>
            <label htmlFor="expectedReturnDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่คืน (ไม่จำเป็น)</label>
            <input
              type="date"
              name="expectedReturnDate"
              id="expectedReturnDate"
              value={borrowFormData.expectedReturnDate}
              onChange={handleBorrowFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (ไม่จำเป็น)</label>
            <textarea
              name="notes"
              id="notes"
              value={borrowFormData.notes}
              onChange={handleBorrowFormChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="ระบุหมายเหตุเพิ่มเติม..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => { setIsBorrowFormOpen(false); resetBorrowForm(); setError(null); }}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-150"
              disabled={(assets ?? []).filter(asset => asset.status === 'ใช้งาน').length === 0 || borrowers.length === 0}
            >
              บันทึกการยืมครุภัณฑ์
            </button>
          </div>
        </form>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog
        isOpen={isReturnConfirmOpen}
        onClose={() => { setIsReturnConfirmOpen(false); setSelectedRecordToReturn(null); setError(null); }}
        title="ยืนยันการคืนครุภัณฑ์"
        className="max-w-sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700 mb-4">
            ต้องการทำเครื่องหมายว่าได้คืน "
            <span className="font-semibold text-indigo-600">{selectedRecordToReturn?.asset?.assetName}</span>" แล้วหรือไม่?
          </p>
        </div>
        <div className="flex justify-center space-x-3 mt-6">
          <button
            type="button"
            onClick={() => { setIsReturnConfirmOpen(false); setSelectedRecordToReturn(null); setError(null); }}
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirmReturn}
            className="px-5 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-colors duration-150"
          >
            ยืนยันการคืน
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default BorrowingRecordManagement;