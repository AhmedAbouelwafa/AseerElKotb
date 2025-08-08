import { Ibook } from './Ibook';

export interface BookResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  message: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Ibook[];
  succeeded: boolean;
  statusCode: number;
  meta: any | null;
  errors: any | null;
}
