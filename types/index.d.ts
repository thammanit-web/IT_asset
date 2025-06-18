export interface Asset {
  id: number;
  assetName: string;
  assetID: string;
  description?: string;
  groupType: string;
  status: string; // e.g., "Available", "Borrowed", "Maintenance"
  imgUrl?: string;
  createdAt: string;
  updatedAt: string;
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