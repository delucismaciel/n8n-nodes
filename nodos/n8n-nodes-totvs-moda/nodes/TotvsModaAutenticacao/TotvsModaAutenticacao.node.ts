import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { totvsModaAutenticacaoProperties } from './description';
import { executeOperation } from './execute';

export class TotvsModaAutenticacao implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Totvs Moda Autenticação',
    name: 'totvsModaAutenticacao',
    icon: 'file:totvs-moda-autenticacao.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Gera access token do Totvs Moda v2 via grant_type=password.',
    defaults: {
      name: 'Totvs Moda Autenticação',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: totvsModaAutenticacaoProperties,
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i += 1) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;

        const result = await executeOperation.call(this, operation, i);

        returnData.push({ json: result, pairedItem: { item: i } });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
