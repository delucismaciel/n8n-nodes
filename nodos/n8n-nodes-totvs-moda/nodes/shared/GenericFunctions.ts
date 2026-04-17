import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import {
  DEFAULT_PAGE_SIZE,
  TOTVS_MODA_PRODUCT_BASE_PATH,
  type TotvsModaErrorBody,
  type TotvsModaPaginatedResponse,
} from './types';

function normalizeBaseUrl(baseUrl: string): string {
  if (!baseUrl) {
    throw new Error('Base URL vazio.');
  }
  return baseUrl.replace(/\/+$/, '');
}

export async function totvsModaApiRequest(
  this: IExecuteFunctions,
  baseUrl: string,
  accessToken: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  qs?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  if (!accessToken) {
    throw new NodeOperationError(
      this.getNode(),
      'Access Token não informado. Preencha o campo "Access Token" com o token emitido pelo endpoint de autorização.',
    );
  }

  const url = `${normalizeBaseUrl(baseUrl)}${TOTVS_MODA_PRODUCT_BASE_PATH}${endpoint}`;

  const options: IHttpRequestOptions = {
    method,
    url,
    qs,
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    json: true,
  };

  if (body === undefined) {
    delete options.body;
  }
  if (qs === undefined || Object.keys(qs).length === 0) {
    delete options.qs;
  }

  try {
    return (await this.helpers.httpRequest(options)) as IDataObject | IDataObject[];
  } catch (error) {
    const err = error as { statusCode?: number; response?: { body?: TotvsModaErrorBody } };
    if (err.statusCode === 401) {
      throw new NodeApiError(this.getNode(), error as JsonObject, {
        message: 'Token inválido ou expirado. Autentique novamente antes de chamar este node.',
        httpCode: '401',
      });
    }
    const apiMessage = err.response?.body?.detailedMessage ?? err.response?.body?.message;
    if (apiMessage) {
      throw new NodeApiError(this.getNode(), error as JsonObject, { message: apiMessage });
    }
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

export async function totvsModaApiRequestAllItemsQuery(
  this: IExecuteFunctions,
  baseUrl: string,
  accessToken: string,
  endpoint: string,
  qs: IDataObject,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<IDataObject[]> {
  const results: IDataObject[] = [];
  let page = 1;

  while (true) {
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'GET',
      endpoint,
      undefined,
      { ...qs, Page: page, PageSize: pageSize },
    )) as TotvsModaPaginatedResponse<IDataObject> | IDataObject[];

    const items = Array.isArray(response) ? response : (response.items ?? []);
    results.push(...items);

    if (items.length < pageSize) break;
    page += 1;
  }

  return results;
}

export async function totvsModaApiRequestAllItemsBody(
  this: IExecuteFunctions,
  baseUrl: string,
  accessToken: string,
  endpoint: string,
  body: IDataObject,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<IDataObject[]> {
  const results: IDataObject[] = [];
  let page = 1;

  while (true) {
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'POST',
      endpoint,
      { ...body, page, pageSize },
    )) as TotvsModaPaginatedResponse<IDataObject>;

    const items = response.items ?? [];
    results.push(...items);

    if (items.length < pageSize) break;
    page += 1;
  }

  return results;
}

export function pickFields(item: IDataObject, fields: string[]): IDataObject {
  if (!fields || fields.length === 0) return item;
  const out: IDataObject = {};
  for (const key of fields) {
    if (key in item) out[key] = item[key];
  }
  return out;
}

export function applyLimit<T>(items: T[], limit: number): T[] {
  if (limit <= 0) return items;
  return items.slice(0, limit);
}
