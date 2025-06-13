import { useState, useEffect } from 'react';
import { Asset, CreateAssetData, UpdateAssetData } from '@/types/asset';

interface UseAssetsResult {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchAssets: (params?: {
    search?: string;
    groupType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  createAsset: (data: CreateAssetData) => Promise<Asset>;
  updateAsset: (id: number, data: Partial<UpdateAssetData>) => Promise<Asset>;
  deleteAsset: (id: number) => Promise<void>;
}

export function useAssets(): UseAssetsResult {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchAssets = async (params?: {
    search?: string;
    groupType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.groupType) searchParams.set('groupType', params.groupType);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const response = await fetch(`/api/assets?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      setAssets(data.assets);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (data: CreateAssetData): Promise<Asset> => {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create asset');
    }

    const asset = await response.json();
    await fetchAssets(); // Refresh the list
    return asset;
  };

  const updateAsset = async (id: number, data: Partial<UpdateAssetData>): Promise<Asset> => {
    const response = await fetch(`/api/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update asset');
    }

    const asset = await response.json();
    await fetchAssets(); // Refresh the list
    return asset;
  };

  const deleteAsset = async (id: number): Promise<void> => {
    const response = await fetch(`/api/assets/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete asset');
    }

    await fetchAssets(); // Refresh the list
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return {
    assets,
    loading,
    error,
    pagination,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  };
}

