export interface Asset {
  id: number;
  assetName: string;
  assetID: string;
  description?: string | null;
  groupType: string;
  status: string;
  imgUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssetData {
  assetName: string;
  assetID: string;
  description?: string;
  groupType: string;
  status: string;
  imgUrl?: string;
}

export interface UpdateAssetData extends Partial<CreateAssetData> {
  id: number;
}

export type GroupType = 'computer' | 'laptop' | 'monitor' | 'printer' | 'server' | 'network' | 'other';

export type AssetStatus = 'ใช้งาน' | 'ไม่ใช้งาน' | 'ซ่อมบำรุง' | 'สำรอง' | 'สูญหาย';

