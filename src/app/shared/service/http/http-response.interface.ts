export interface HttpResponse<T> {
  id: string | null;
  data: T;
  status: number;
  message?: string;
  meta?: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}