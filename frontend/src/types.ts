export interface DettagliCamera {
    idcamera: number
    nomecamera: string
    descrizionecamera: string
    imgcamera: string
    prezzocamera: number
}

export interface Prenotazione {
    idprenotazione: number;
    idcamera: number;
    username: string; 
    datainizio: string;
    datafine: string;
    ospiti: number;
}