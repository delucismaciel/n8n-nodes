import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import {
  applyLimit,
  pickFields,
  totvsModaApiRequest,
  totvsModaApiRequestAllItemsBody,
  totvsModaApiRequestAllItemsQuery,
} from '../shared/GenericFunctions';

async function executeListCategories(
  this: IExecuteFunctions,
  itemIndex: number,
  baseUrl: string,
  accessToken: string,
): Promise<IDataObject[]> {
  const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
  const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
  const fields = this.getNodeParameter('fields', itemIndex, []) as string[];

  const qs: IDataObject = {};
  if (filters.StartChangeDate) qs.StartChangeDate = filters.StartChangeDate;
  if (filters.EndChangeDate) qs.EndChangeDate = filters.EndChangeDate;
  if (filters.Order) qs.Order = filters.Order;

  let items: IDataObject[];
  if (returnAll) {
    items = await totvsModaApiRequestAllItemsQuery.call(
      this,
      baseUrl,
      accessToken,
      '/category',
      qs,
    );
  } else {
    const limit = this.getNodeParameter('limit', itemIndex) as number;
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'GET',
      '/category',
      undefined,
      { ...qs, Page: 1, PageSize: limit },
    )) as { items?: IDataObject[] } | IDataObject[];
    const rawItems = Array.isArray(response) ? response : (response.items ?? []);
    items = applyLimit(rawItems, limit);
  }

  return items.map((it) => pickFields(it, fields));
}

async function executeSearchProducts(
  this: IExecuteFunctions,
  itemIndex: number,
  baseUrl: string,
  accessToken: string,
): Promise<IDataObject[]> {
  const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
  const filter = this.getNodeParameter('filter', itemIndex, {}) as IDataObject;
  const expand = this.getNodeParameter('expand', itemIndex, []) as string[];
  const fields = this.getNodeParameter('fields', itemIndex, []) as string[];

  const body: IDataObject = { filter };
  if (expand.length > 0) body.expand = expand;

  let items: IDataObject[];
  if (returnAll) {
    items = await totvsModaApiRequestAllItemsBody.call(
      this,
      baseUrl,
      accessToken,
      '/products/search',
      body,
    );
  } else {
    const limit = this.getNodeParameter('limit', itemIndex) as number;
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'POST',
      '/products/search',
      { ...body, page: 1, pageSize: limit },
    )) as { items?: IDataObject[] };
    items = applyLimit(response.items ?? [], limit);
  }

  return items.map((it) => pickFields(it, fields));
}

export async function executeOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
  baseUrl: string,
  accessToken: string,
): Promise<IDataObject[]> {
  switch (operation) {
    case 'listCategories':
      return executeListCategories.call(this, itemIndex, baseUrl, accessToken);
    case 'searchProducts':
      return executeSearchProducts.call(this, itemIndex, baseUrl, accessToken);
    default:
      throw new Error(`Operação não suportada: ${operation}`);
  }
}
