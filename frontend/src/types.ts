export interface dettaglicamera {
    idcamera: number
    nomecamera: string
    descrizionecamera: string
    imgcamera: string
    prezzocamera: number
}

//camera
export interface prenotazioni {
    idprenotazione: number;
    idcamera: number;
    username: string; 
    datainizio: string;
    datafine: string;
    ospiti: number;
}

  //ristorante
export interface prenotazioni_ristorante {
    idtavolo: number;
    username: string;
    ospiti: number;
    data: string;
    ora: string;

}

export interface utenti {
    username: string;
    password: string;
    ruolo: string;
    nome: string;
}

export interface recensioni {
    idRecensione: number;
    username: string;
    testo: string;
    voto: number;
}


export interface MenuItem {
    idpiatto: number;
    piatto: string;
    descrizionepiatto: string;
    prezzopiatto: number;
    editing?: boolean;
    original?: {
      piatto: string;
      descrizionepiatto: string;
      prezzopiatto: number;
    };
  }