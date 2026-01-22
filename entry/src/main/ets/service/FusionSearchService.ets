import fs from '@ohos.file.fs';
import type { Context } from '@ohos.abilityAccessCtrl';
import { BusinessError } from '@ohos.base';

// 显式定义搜索结果接口
export interface SearchResult {
  type: 'file' | 'cloud' | 'device';
  title: string;
  path: string;
  score: number;
}

export class FusionSearchService {
  async semanticSearch(keyword: string): Promise<Array<SearchResult>> {
    if (!keyword || keyword.trim() === '') {
      return [];
    }
    try {
      const fileResults = await this.searchFiles(keyword.trim());
      const cloudResults: Array<SearchResult> = [];
      return [...fileResults, ...cloudResults];
    } catch (error) {
      console.error('搜索失败:', (error as BusinessError).message);
      return [];
    }
  }

  private async searchFiles(keyword: string): Promise<Array<SearchResult>> {
    try {
      const context: Context = getContext(this) as Context;
      const filesDir = context.filesDir;
      if (!fs.accessSync(filesDir)) return [];

      const files = fs.listFileSync(filesDir);
      return files.map((fileName: string): SearchResult => {
        const path = `${filesDir}/${fileName}`;
        return {
          type: 'file', // 直接赋值，无需 as const
          title: fileName,
          path: path,
          score: fileName.includes(keyword) ? 100 : 0
        };
      }).filter((item: SearchResult) => item.score > 0);
    } catch (error) {
      console.error('文件搜索失败:', (error as BusinessError).message);
      return [];
    }
  }
}

export const fusionSearchService = new FusionSearchService();