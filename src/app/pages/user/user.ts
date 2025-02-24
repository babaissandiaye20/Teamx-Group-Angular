export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  address: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  DeletedAt?: Date;
}

export interface CreateUserDto {
  firstname: string;
  lastname: string;
  address: string;
}

export interface UpdateUserDto {
  firstname?: string;
  lastname?: string;
  address?: string;
}

export interface FindUserDto {
  firstname?: string;
  lastname?: string;
  address?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationInfo {
  totalItems: number;
  itemsPerPage: number; 
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}