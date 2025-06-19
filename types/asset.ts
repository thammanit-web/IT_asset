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

export interface Borrower {
  id: number;
  fullName: string;
  department: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowingRecord {
  id: number;
  assetId: number;
  borrowerId: number;
  borrowDate: string;
  returnDate?: string;
  status: string; // "Borrowed" or "Returned"
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Extended interface for records when including relations from the API
export interface BorrowingRecordWithRelations extends BorrowingRecord {
  asset: Asset;
  borrower: Borrower;
}

export type GroupType = 'computer' | 'laptop' | 'monitor' | 'printer' | 'PC Only' | 'network' | 'other';

export type AssetStatus = 'ใช้งาน' | 'ไม่ใช้งาน' | 'ซ่อมบำรุง' | 'สำรอง' | 'สูญหาย';

