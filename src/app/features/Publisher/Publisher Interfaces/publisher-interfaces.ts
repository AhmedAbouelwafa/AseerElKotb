export interface Publisher {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  contactEmail: string;
}

export interface PublishersResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  data: Publisher[];
  succeeded: boolean;
}