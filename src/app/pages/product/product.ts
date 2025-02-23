export interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

export interface CreateProductDto {
  name: string;
  price: number;
  quantity: number;
  image?: string | File | null;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  quantity?: number;
  image?: string | File | null;
}

export interface FindProductDto {
  name?: string;
  price?: number;
  quantity?: number;
  page?: number;
  limit?: number;
}
