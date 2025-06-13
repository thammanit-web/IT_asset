'use client';

import { Asset } from '@/types/asset';
import { Edit, Trash2, Eye, Download } from 'lucide-react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { useState } from 'react';

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onView: (asset: Asset) => void;
}

export default function AssetTable({ assets, onEdit, onDelete, onView }: AssetTableProps) {
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ใช้งาน':
        return 'bg-green-100 text-green-800';
      case 'ไม่ใช้งาน':
        return 'bg-gray-100 text-gray-800';
      case 'ซ่อมบำรุง':
        return 'bg-yellow-100 text-yellow-800';
      case 'สำรอง':
        return 'bg-red-100 text-red-800';
      case 'สูญหาย':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch all assets from the API
      const response = await fetch('/api/assets?all=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all assets');
      }

      const allAssets: Asset[] = await response.json();

      // Prepare data for Excel export
      const exportData = allAssets.map(asset => ({
        'ชื่อครุภัณฑ์': asset.assetName,
        'หมายเลขครุภัณฑ์': asset.assetID,
        'คำอธิบาย': asset.description || '',
        'ประเภท': asset.groupType,
        'สถานะ': asset.status,
        'วันที่เพิ่ม': formatDate(asset.createdAt),
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Asset Name
        { wch: 15 }, // Asset ID
        { wch: 40 }, // Description
        { wch: 15 }, // Group Type
        { wch: 12 }, // Status
        { wch: 15 }, // Created Date
      ];
      worksheet['!cols'] = columnWidths;


      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `export_assets_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No assets found. Add your first asset to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportToExcel}
          disabled={isExporting}
          className={`inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
            isExporting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Download size={16} className="mr-2" />
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รูปภาพ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ชื่อครุภัณฑ์
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                หมายเลขครุภัณฑ์
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                เวลาที่เพิ่ม
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-12 h-12 overflow-hidden rounded-md">
                    {asset.imgUrl ? (
                      <Image
                        src={asset.imgUrl}
                        alt={asset.assetName}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 48px, 64px"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{asset.assetName}</div>
                  {asset.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {asset.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{asset.assetID}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">{asset.groupType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}
                  >
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(asset)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(asset)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                      title="Edit Asset"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(asset)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}