export interface Nivell {
  nivell: number;
  nom: string;
  imatge_url: string;
}

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
  nau_actual: string | null;
}

export interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
  punts_totals: number;
  nivell: Nivell;
}

export interface ApiResponse {
  success: boolean;
  estadistiques: {
    general: {
      punts_totals: number;
      nivell_actual: Nivell;
    };
    partides: {
      millor_puntuacio: number;
      total_partides: number;
      temps_total_jugat: number;
    };
  };
}

export interface GlobalStats {
  posicio?: number;
  username: string;
  punts_totals: number;
  total_partides: number;
  millor_puntuacio: number;
  temps_total_jugat: number;
} 
