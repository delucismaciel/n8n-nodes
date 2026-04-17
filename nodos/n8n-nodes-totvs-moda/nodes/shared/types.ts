export interface TotvsModaPaginatedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface TotvsModaErrorBody {
  message?: string;
  detailedMessage?: string;
  code?: string | number;
  details?: unknown;
}

export const TOTVS_MODA_PRODUCT_BASE_URL =
  'https://www30.bhan.com.br:9443/api/totvsmoda/product/v2';

export const DEFAULT_PAGE_SIZE = 1000;
