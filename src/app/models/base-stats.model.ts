import { IResetableStats } from '../interfaces/stats.interface';

export class BaseStatsModel {
    protected resetStats(stats: IResetableStats): void {
        stats.punts_totals = 0;
    }
} 