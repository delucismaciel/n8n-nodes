import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestOptions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const TOKEN_URL = 'https://www30.bhan.com.br:9443/api/totvsmoda/authorization/v2/token';

async function executeRefreshToken(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<IDataObject> {
  const clientId = this.getNodeParameter('clientId', itemIndex) as string;
  const clientSecret = this.getNodeParameter('clientSecret', itemIndex) as string;
  const username = this.getNodeParameter('username', itemIndex) as string;
  const password = this.getNodeParameter('password', itemIndex) as string;

  const form = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password,
  }).toString();

  const options: IHttpRequestOptions = {
    method: 'POST',
    url: TOKEN_URL,
    body: form,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    json: false,
  };

  try {
    const response = await this.helpers.httpRequest(options);
    if (typeof response === 'string') {
      return JSON.parse(response) as IDataObject;
    }
    return response as IDataObject;
  } catch (error) {
    const err = error as {
      response?: { body?: { message?: string; error_description?: string; error?: string } };
    };
    const body = err.response?.body;
    const apiMessage = body?.error_description ?? body?.message ?? body?.error;
    if (apiMessage) {
      throw new NodeApiError(this.getNode(), error as JsonObject, { message: apiMessage });
    }
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}

export async function executeOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<IDataObject> {
  switch (operation) {
    case 'refreshToken':
      return executeRefreshToken.call(this, itemIndex);
    default:
      throw new Error(`Operação não suportada: ${operation}`);
  }
}
