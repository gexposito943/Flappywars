import { IResetableStats } from '../interfaces/base-stats.interface';

export class BaseStatsModel {
    protected resetStats(stats: IResetableStats): void {
        stats.punts_totals = 0;
    }
} 