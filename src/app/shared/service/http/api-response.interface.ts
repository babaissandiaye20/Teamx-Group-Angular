// http-response.interface.ts
export interface ApiResponse<T> {
  data: {
    data: T;
    message: string;
    meta: {
      lastPage: number;
      limit: number;
      page: number;
      total: number;
    }
  };
  status: number;
  id: string;
}
