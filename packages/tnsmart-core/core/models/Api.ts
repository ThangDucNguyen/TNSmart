export interface APIError {
  status: string;
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
}

export interface APIResponse<T> {
  status?: string;
  data?: T;
}

export enum ApiStatus {
  OK = 'OK',
}
