'use client';

import { useState } from 'react';
import { Plus, Download, AlertCircle } from 'lucide-react';
import AssetTable from '@/components/AssetTable';
import AssetForm from '@/components/AssetForm';
import SearchFilter from '@/components/SearchFilter';
import { useAssets } from '@/hooks/useAssets';
import { Asset, CreateAssetData } from '@/types/asset';
import { exportToPDF } from '@/lib/pdfExport';

export default function HomePage() {
  const {
    assets,
    loading,
    error,
    pagination,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  } = useAssets();

  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Asset | null>(null);
  const [searchParams, setSearchParams] = useState({
    search: '',
    groupType: '',
    status: ''
  });

  const handleSearch = (params: { search: string; groupType: string; status: string }) => {
    setSearchParams(params);
    fetchAssets({
      search: params.search || undefined,
      groupType: params.groupType || undefined,
      status: params.status || undefined,
      page: 1
    });
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowForm(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleViewAsset = (asset: Asset) => {
    setViewingAsset(asset);
  };

  const handleDeleteAsset = (asset: Asset) => {
    setDeleteConfirm(asset);
  };

  const handleFormSubmit = async (data: CreateAssetData) => {
    if (editingAsset) {
      await updateAsset(editingAsset.id, data);
    } else {
      await createAsset(data);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteAsset(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(assets, {
        search: searchParams.search,
        groupType: searchParams.groupType,
        status: searchParams.status
      });
    } catch (error) {
      alert('Failed to export PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ระบบจัดการครุภัณฑ์ </h1>
          <p className="mt-2 text-gray-600">
            จัดการและติดตามสินทรัพย์ไอทีขององค์กร
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={handleAddAsset}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
           เพิ่มครุภัณฑ์
          </button>
        </div>

        <SearchFilter onSearch={handleSearch} />


        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Assets Table */}
        {!loading && (
          <>
            <AssetTable
              assets={assets}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              onView={handleViewAsset}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  แสดง {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} ผลลัพธ์
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchAssets({ page: pagination.page - 1 })}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => fetchAssets({ page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Asset Form Modal */}
        <AssetForm
          asset={editingAsset}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isOpen={showForm}
        />

        {/* View Asset Modal */}
        {viewingAsset && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-400 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">รายละเอียดครุภัณฑ์</h2>
                <button
                  onClick={() => setViewingAsset(null)}
                  className="text-gray-400 hover:text-gray-600 text-[24px]"
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <strong>รูปภาพ :</strong>
                  <div className="mt-1">
                    <img
                      src={viewingAsset.imgUrl || ''}
                      alt={viewingAsset.assetName}
                      className="w-full h-auto rounded border border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <strong>ชื่อครุภัณฑ์ :</strong> {viewingAsset.assetName}
                </div>
                <div>
                  <strong>หมายเลขครุภัณฑ์ :</strong> {viewingAsset.assetID}
                </div>
                <div>
                  <strong>คำอธิบายครุภัณฑ์ :</strong> {viewingAsset.description || 'N/A'}
                </div>
                <div>
                  <strong>ประเภท :</strong> {viewingAsset.groupType}
                </div>
                <div>
                  <strong>สถานะ :</strong> {viewingAsset.status}
                </div>
                <div>
                  <strong>เวลาที่เพิ่ม :</strong> {new Date(viewingAsset.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}


        {deleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-400 shadow-lg">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold">ยืนยันที่จะลบ</h2>
              </div>
              <p className="mb-6 text-gray-600">
                คุณแน่ใจที่จะลบ "{deleteConfirm.assetName}" หรือไม่?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  ลบ
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

