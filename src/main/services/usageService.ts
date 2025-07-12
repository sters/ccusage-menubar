import { loadDailyUsageData } from 'ccusage/data-loader';

interface ExtendedDailyUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  modelsUsed: string[];
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  totalCost?: number;
  cost?: number;
}

export interface UsageData {
  today: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    totalCost: number;
    modelsUsed: string[];
  };
  daily: Array<{
    date: string;
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    totalCost: number;
    modelsUsed: string[];
  }>;
}

export class UsageService {
  async fetchUsageData(): Promise<UsageData> {
    try {
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get date 7 days ago for weekly data
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Get tomorrow to include all of today's data
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Format dates as YYYYMMDD for ccusage
      const since = weekAgo.toISOString().split('T')[0].replace(/-/g, '');
      const until = tomorrow.toISOString().split('T')[0].replace(/-/g, '');

      console.log('Fetching usage data from', since, 'to', until);

      // Use loadDailyUsageData directly from ccusage
      const dailyData = await loadDailyUsageData({
        since,
        until,
        order: 'asc'
      }) as ExtendedDailyUsage[];

      console.log('Daily usage data:', dailyData);

      // Find today's data (date format is YYYY-MM-DD)
      const todayStr = today.toISOString().split('T')[0];
      const todayData = dailyData.find((d) => d.date === todayStr);
      
      console.log('[ELECTRON] Today data:', todayData);

      // Format the data
      const usageData: UsageData = {
        today: {
          inputTokens: todayData?.inputTokens || 0,
          outputTokens: todayData?.outputTokens || 0,
          cacheCreationTokens: todayData?.cacheCreationTokens || 0,
          cacheReadTokens: todayData?.cacheReadTokens || 0,
          totalCost: todayData?.totalCost || todayData?.cost || 0,
          modelsUsed: todayData?.modelsUsed || [],
        },
        daily: dailyData.map((d) => ({
          date: d.date,
          inputTokens: d.inputTokens,
          outputTokens: d.outputTokens,
          cacheCreationTokens: d.cacheCreationTokens || 0,
          cacheReadTokens: d.cacheReadTokens || 0,
          totalCost: d.totalCost || d.cost || 0,
          modelsUsed: d.modelsUsed || [],
        })),
      };

      return usageData;
    } catch (error) {
      console.error('Error fetching usage data:', error);
      // Return empty data on error
      return {
        today: {
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0,
          modelsUsed: [],
        },
        daily: [],
      };
    }
  }
}

export const usageService = new UsageService();
