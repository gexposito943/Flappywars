export interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
  punts_totals: number;
  nivell: {
    numero: number;
    nom: string;
    imatge_url: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  ranking?: T;
  estadistiques?: {
    general: {
      punts_totals: number;
      nivell_actual: {
        nivell: number;
        nom: string;
        imatge: string;
      };
    };
    partides: {
      total_partides: number;
      millor_puntuacio: number;
      temps_total_jugat: number;
    };
  };
} 