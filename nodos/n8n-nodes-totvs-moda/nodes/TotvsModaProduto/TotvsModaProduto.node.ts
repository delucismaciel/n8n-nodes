import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import { totvsModaProdutoProperties } from './description';
import { executeOperation } from './execute';

export class TotvsModaProduto implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Totvs Moda Produto',
    name: 'totvsModaProduto',
    icon: 'file:totvs-moda-produto.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Consulta dados do módulo Produto do Totvs Moda v2.',
    defaults: {
      name: 'Totvs Moda Produto',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: totvsModaProdutoProperties,
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i += 1) {
      try {
        const baseUrl = this.getNodeParameter('baseUrl', i) as string;
        const accessToken = this.getNodeParameter('accessToken', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        const results = await executeOperation.call(this, operation, i, baseUrl, accessToken);

        for (const row of results) {
          returnData.push({ json: row, pairedItem: { item: i } });
        }
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
