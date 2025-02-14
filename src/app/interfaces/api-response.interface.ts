import { Nivell } from './nivell.interface';
import { BaseStats } from './base-stats.interface';
import { Nau } from './nau.interface';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    ranking?: T;
    nau?: Nau;
    estadistiques?: {
        general: {
            punts_totals: number;
            nivell_actual: Omit<Nivell, 'imatge_url'> & { imatge: string };
        };
        partides: BaseStats;
    };
} 