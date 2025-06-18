'use client';

import { useEffect, useState } from 'react';
import { fetchAssets } from '@/lib/api';
import { Asset } from '@/types/asset';

export default function TestApiPage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    fetchAssets({ all: true }).then(setAssets).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📦 Test API Page</h1>
      <h2 className="text-lg font-semibold">Assets:</h2>
      <ul className="list-disc pl-6">
        {assets.map((asset) => (
          <li key={asset.id}>
            {asset.assetName} ({asset.assetID}) - {asset.groupType}
          </li>
        ))}
      </ul>
    </div>
  );
}
