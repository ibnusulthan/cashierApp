export interface Category {
  id: string;
  name: string;
}

export interface Products {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  category: Category; // Untuk menampilkan nama kategori di tabel
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}