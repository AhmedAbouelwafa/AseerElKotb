export interface Governorate {
  id: number;
  name: string;
  nmae?: string; // Backend typo field - temporary compatibility
}

export interface GovernoratesResponse {
  data: Governorate[];
  message: string | null;
  succeeded: boolean;
  statusCode: number;
  errors: any;
}