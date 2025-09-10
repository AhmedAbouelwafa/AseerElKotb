export interface City {
  id: number;
  name: string;
  governorateId: number;
  nmae?: string; // Backend typo field - temporary compatibility
}

export interface CitiesResponse {
  data: City[];
  message: string | null;
  succeeded: boolean;
  statusCode: number;
  errors: any;
}