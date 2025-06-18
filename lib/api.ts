import { BorrowingRecordWithRelations, Asset, Borrower } from "@/types/asset";

const API_BASE_URL = '/api'; // Assuming your Next.js API routes are under /api

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// --- Asset API Calls ---
export const fetchAssets = async (params?: { all?: boolean; page?: number; limit?: number }) => {
  const query = new URLSearchParams();

  if (params?.all) query.set('all', 'true');
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/assets?${query.toString()}`);

  if (params?.all) {
    // all=true → return array
    return handleResponse<Asset[]>(response);
  } else {
    const data = await handleResponse<{ assets: Asset[]; pagination: any }>(response);
    return data.assets;
  }
};


export const createAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assetData),
  });
  return handleResponse<Asset>(response);
};

export const updateAsset = async (id: number, assetData: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assetData),
  });
  return handleResponse<Asset>(response);
};

export const deleteAsset = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
    method: 'DELETE',
  });
  // No content for successful delete, just check response.ok
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
};

// --- Borrower API Calls ---
export const fetchBorrowers = async () => {
  const response = await fetch(`${API_BASE_URL}/borrowers`);
  return handleResponse<Borrower[]>(response);
};

export const createBorrower = async (borrowerData: Omit<Borrower, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await fetch(`${API_BASE_URL}/borrowers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(borrowerData),
  });
  return handleResponse<Borrower>(response);
};

export const updateBorrower = async (id: number, borrowerData: Partial<Omit<Borrower, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const response = await fetch(`${API_BASE_URL}/borrowers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(borrowerData),
  });
  return handleResponse<Borrower>(response);
};

export const deleteBorrower = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/borrowers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
};

// --- Borrowing Record API Calls ---
export const fetchBorrowingRecords = async () => {
  const response = await fetch(`${API_BASE_URL}/borrowing-records`);
  return handleResponse<BorrowingRecordWithRelations[]>(response);
};

export const createBorrowingRecord = async (recordData: { assetId: number; borrowerId: number; expectedReturnDate?: string; notes?: string }) => {
  const response = await fetch(`${API_BASE_URL}/borrowing-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData),
  });
  return handleResponse<BorrowingRecordWithRelations>(response);
};

export const updateBorrowingRecord = async (id: number, recordData: Partial<{ status: string; returnDate?: string; notes?: string }>) => {
  const response = await fetch(`${API_BASE_URL}/borrowing-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData),
  });
  return handleResponse<BorrowingRecordWithRelations>(response);
};

export const deleteBorrowingRecord = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/borrowing-records/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
};

export type { Asset,Borrower, BorrowingRecordWithRelations };



