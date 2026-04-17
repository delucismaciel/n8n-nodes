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
      accessToken,
      '/category',
      qs,
    );
  } else {
    const limit = this.getNodeParameter('limit', itemIndex) as number;
    const response = (await totvsModaApiRequest.call(
      this,
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
  accessToken: string,
): Promise<IDataObject[]> {
  const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
  const rawFilter = this.getNodeParameter('filter', itemIndex, {}) as IDataObject;
  const expand = this.getNodeParameter('expand', itemIndex, []) as string[];
  const fields = this.getNodeParameter('fields', itemIndex, []) as string[];

  const filter: IDataObject = {};
  
  if (typeof rawFilter.isActive === 'boolean') {
    filter.isActive = rawFilter.isActive;
  }

  const change: IDataObject = {};
  if (rawFilter.startChangeDate) change.startDate = rawFilter.startChangeDate;
  if (rawFilter.endChangeDate) change.endDate = rawFilter.endChangeDate;
  
  if (Object.keys(change).length > 0) {
    change.inProduct = rawFilter.inProduct !== undefined ? rawFilter.inProduct : true;
    filter.change = change;
  }

  if (rawFilter.productCodeList) {
    const list = String(rawFilter.productCodeList)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n));
    if (list.length > 0) filter.productCodeList = list;
  }
  
  if (rawFilter.referenceCodeList) {
    const list = String(rawFilter.referenceCodeList)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length > 0) filter.referenceCodeList = list;
  }

  // --- CORREÇÃO AQUI ---
  // A API rejeita '0' como vazio. Usamos '1' como fallback seguro baseado no seu JWT.
  let branchInfoCode = 1; 
  if (rawFilter.branchInfoCode !== undefined && rawFilter.branchInfoCode !== '') {
    branchInfoCode = Number(rawFilter.branchInfoCode);
  }

  const option: IDataObject = {
    branchInfoCode: branchInfoCode,
  };

  const body: IDataObject = { 
    filter, 
    option 
  };
  
  if (expand.length > 0) body.expand = expand.join(',');

  let items: IDataObject[];
  
  if (returnAll) {
    items = await totvsModaApiRequestAllItemsBody.call(
      this,
      accessToken,
      '/products/search',
      body,
    );
  } else {
    const limit = this.getNodeParameter('limit', itemIndex) as number;
    const response = (await totvsModaApiRequest.call(
      this,
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
  accessToken: string,
): Promise<IDataObject[]> {
  switch (operation) {
    case 'listCategories':
      return executeListCategories.call(this, itemIndex, accessToken);
    case 'searchProducts':
      return executeSearchProducts.call(this, itemIndex, accessToken);
    default:
      throw new Error(`Operação não suportada: ${operation}`);
  }
}
