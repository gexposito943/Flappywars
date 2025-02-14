import { Nivell } from './nivell.interface';
import { Nau } from './nau.interface';

export interface UserData {
    id: string;
    nom_usuari: string;
    email: string;
    nivell: Nivell;
    punts_totals: number;
    data_registre: string;
    ultim_acces: string | null;
    estat: 'actiu' | 'inactiu' | 'bloquejat';
    intents_login: number;
    nau_actual: Nau | null;
} 