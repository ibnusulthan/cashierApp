export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
};

export interface StockHistory {
  id: string;
  productId: string;
  change: number;
  reason: string;
  createdAt: string;
  product?: {
    name: string;
    imageUrl: string | null;
  }
}

export interface StockHistoryResponse {
  message: string;
  data: StockHistory[];
}

