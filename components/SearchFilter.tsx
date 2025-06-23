'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { GroupType, AssetStatus } from '@/types/asset';

interface SearchFilterProps {
  onSearch: (params: {
    search: string;
    groupType: string;
    status: string;
  }) => void;
}

const groupTypes: GroupType[] = ['computer', 'laptop', 'monitor', 'printer', 'PC Only', 'network', 'other'];
const statuses: AssetStatus[] = ['ใช้งาน' , 'ไม่ใช้งาน' , 'ซ่อมบำรุง' , 'สำรอง' , 'สูญหาย'];

export default function SearchFilter({ onSearch }: SearchFilterProps) {
  const [search, setSearch] = useState('');
  const [groupType, setGroupType] = useState('');
  const [status, setStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({ search, groupType, status });
  };

  const handleClear = () => {
    setSearch('');
    setGroupType('');
    setStatus('');
    onSearch({ search: '', groupType: '', status: '' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ค้นหาโดยชื่อ หมายเลข..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(groupType || status) && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {[groupType, status].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ค้นหา
        </button>

        {/* Clear Button */}
        {(search || groupType || status) && (
          <button
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-2" />
            ล้างการค้นหา
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Group Type Filter */}
            <div>
              <label htmlFor="groupType" className="block text-sm font-medium text-gray-700 mb-1">
                ประเภท
              </label>
              <select
                id="groupType"
                value={groupType}
                onChange={(e) => setGroupType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ประเภททั้งหมด</option>
                {groupTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">สถานะทั้งหมด</option>
                {statuses.map(statusOption => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

