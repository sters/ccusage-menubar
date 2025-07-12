import { loadDailyUsageData } from 'ccusage/data-loader';
export class UsageService {
    async fetchUsageData() {
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
            // Use loadDailyUsageData directly from ccusage
            const dailyData = await loadDailyUsageData({
                since,
                until,
                order: 'asc'
            });
            // Find today's data (date format is YYYY-MM-DD)
            const todayData = dailyData.pop();
            // Format the data
            const usageData = {
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
        }
        catch {
            // Error fetching usage data
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
