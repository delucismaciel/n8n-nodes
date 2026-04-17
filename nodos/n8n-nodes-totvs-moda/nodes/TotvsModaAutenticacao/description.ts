import type { INodeProperties } from 'n8n-workflow';

export const totvsModaAutenticacaoProperties: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    default: 'refreshToken',
    options: [
      {
        name: 'Atualizar Token',
        value: 'refreshToken',
        description: 'POST /authorization/v2/token com grant_type=password',
        action: 'Solicita um novo access token',
      },
    ],
  },
  {
    displayName: 'Client ID',
    name: 'clientId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: { show: { operation: ['refreshToken'] } },
    description: 'Identificador do cliente fornecido pela Totvs',
  },
  {
    displayName: 'Client Secret',
    name: 'clientSecret',
    type: 'string',
    typeOptions: { password: true },
    default: '',
    required: true,
    displayOptions: { show: { operation: ['refreshToken'] } },
    description: 'Segredo do cliente fornecido pela Totvs',
  },
  {
    displayName: 'Username',
    name: 'username',
    type: 'string',
    default: '',
    required: true,
    displayOptions: { show: { operation: ['refreshToken'] } },
    description: 'Usuário do ERP Totvs Moda',
  },
  {
    displayName: 'Password',
    name: 'password',
    type: 'string',
    typeOptions: { password: true },
    default: '',
    required: true,
    displayOptions: { show: { operation: ['refreshToken'] } },
    description: 'Senha do usuário do ERP Totvs Moda',
  },
];
