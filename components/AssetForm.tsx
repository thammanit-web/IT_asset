'use client';

import { useState, useEffect } from 'react';
import { Asset, CreateAssetData, GroupType, AssetStatus } from '@/types/asset';
import { X } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface AssetFormProps {
  asset?: Asset | null;
  onSubmit: (data: CreateAssetData) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const groupTypes: GroupType[] = ['computer', 'laptop', 'monitor', 'printer', 'PC Only', 'network', 'other'];
const statuses: AssetStatus[] = ['ใช้งาน' , 'ไม่ใช้งาน' , 'ซ่อมบำรุง' , 'สำรอง' , 'สูญหาย'];

export default function AssetForm({ asset, onSubmit, onCancel, isOpen }: AssetFormProps) {
  const [formData, setFormData] = useState<CreateAssetData>({
    assetName: '',
    assetID: '',
    description: '',
    groupType: 'computer',
    status: 'ใช้งาน',
    imgUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setFormData({
        assetName: asset.assetName,
        assetID: asset.assetID,
        description: asset.description || '',
        groupType: asset.groupType as GroupType,
        status: asset.status as AssetStatus,
        imgUrl: asset.imgUrl || ''
      });
    } else {
      setFormData({
        assetName: '',
        assetID: '',
        description: '',
        groupType: 'computer',
        status: 'ใช้งาน',
        imgUrl: ''
      });
    }
    setError(null);
  }, [asset, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onCancel(); // Close the form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imgUrl: imageUrl
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      imgUrl: ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-300 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {asset ? 'แก้ไข' : 'เพิ่ม'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อครุภัณฑ์ *
            </label>
            <input
              type="text"
              id="assetName"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             
            />
          </div>

          <div>
            <label htmlFor="assetID" className="block text-sm font-medium text-gray-700 mb-1">
              หมายเลขครุภัณฑ์ *
            </label>
            <input
              type="text"
              id="assetID"
              name="assetID"
              value={formData.assetID}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
             คำอธิบายครุภัณฑ์
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              
            />
          </div>

          <div>
            <label htmlFor="groupType" className="block text-sm font-medium text-gray-700 mb-1">
              ประเภท *
            </label>
            <select
              id="groupType"
              name="groupType"
              value={formData.groupType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {groupTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload Component */}
          <ImageUpload
            value={formData.imgUrl}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : (asset ? 'แก้ไข' : 'เพิ่ม')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

