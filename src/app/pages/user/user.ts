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
}
