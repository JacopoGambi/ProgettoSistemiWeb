SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
CREATE DATABASE IF NOT EXISTS `Hotel`;
USE `Hotel`;

-- Drop in ordine FK-safe
DROP TABLE IF EXISTS `prenotazioni_spiaggia`;
DROP TABLE IF EXISTS `prenotazioni_ristorante`;
DROP TABLE IF EXISTS `prenotazioni`;
DROP TABLE IF EXISTS `recensioni`;
DROP TABLE IF EXISTS `menu`;
DROP TABLE IF EXISTS `dettaglicamera`;
DROP TABLE IF EXISTS `utenti`;

-- ---------------------------
-- utenti (DB con autenticazione sicura)
-- ---------------------------
CREATE TABLE `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `ruolo` varchar(20) NOT NULL DEFAULT 'cliente',
  `nome` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ATTENZIONE: Password salvate in CHIARO (solo per sviluppo/test locale)
-- Tutti gli utenti usano la password: 'password'
INSERT INTO `utenti` (`username`, `password`, `ruolo`, `nome`) VALUES
('Mario88',  'password', 'cliente',    'Mario Rossi'),
('Chiara3',  'password', 'cliente',    'Chiara Casali'),
('Martina1', 'password', 'dipendente', 'Martina Conficconi'),
('Jacopo2',  'password', 'dipendente', 'Jacopo Gambi');

-- ---------------------------
-- dettaglicamera
-- ---------------------------
CREATE TABLE `dettaglicamera` (
  `idcamera` int(10) unsigned NOT NULL,
  `nomecamera` varchar(100) NOT NULL,
  `descrizionecamera` text NOT NULL,
  `imgcamera` varchar(200) NOT NULL,
  `prezzocamera` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idcamera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `dettaglicamera`
(`idcamera`, `nomecamera`, `descrizionecamera`, `imgcamera`, `prezzocamera`) VALUES
(1, 'Camera Singola', 'Camera standard per 1 ospite, bagno privato, Wi-Fi, TV.', 'singola.jpg', 70.00),
(2, 'Camera Doppia',  'Camera per 2 ospiti, letto matrimoniale, bagno, balcone.', 'doppia.jpg', 120.00),
(3, 'Suite',          'Suite con soggiorno, servizi esclusivi e vista.',        'suite.jpg', 250.00);

-- ---------------------------
-- prenotazioni (camere)
-- username deve essere varchar(20) per FK con utenti
-- idcamera deve essere int unsigned per FK con dettaglicamera
-- ---------------------------
CREATE TABLE `prenotazioni` (
  `idprenotazione` int(11) NOT NULL AUTO_INCREMENT,
  `idcamera` int(10) unsigned NOT NULL,
  `username` varchar(20) NOT NULL,
  `datainizio` date NOT NULL,
  `datafine` date NOT NULL,
  `ospiti` int(11) NOT NULL,
  `stato` varchar(20) DEFAULT 'Confermata',
  PRIMARY KEY (`idprenotazione`),
  KEY `idx_pren_idcamera` (`idcamera`),
  KEY `idx_pren_username` (`username`),
  CONSTRAINT `fk_pren_camera`
    FOREIGN KEY (`idcamera`) REFERENCES `dettaglicamera` (`idcamera`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT `fk_pren_utente`
    FOREIGN KEY (`username`) REFERENCES `utenti` (`username`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `prenotazioni`
(`idprenotazione`, `idcamera`, `username`, `datainizio`, `datafine`, `ospiti`, `stato`) VALUES
(1, 1, 'Mario88', '2026-01-09', '2026-01-16', 1, 'Confermata'),
(2, 2, 'Chiara3', '2026-01-22', '2026-01-23', 2, 'Confermata');

-- ---------------------------
-- recensioni (username varchar(20) per FK)
-- ---------------------------
CREATE TABLE `recensioni` (
  `idRecensione` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `testo` text NOT NULL,
  `voto` int(11) NOT NULL,
  PRIMARY KEY (`idRecensione`),
  KEY `idx_rec_username` (`username`),
  CONSTRAINT `fk_rec_utente`
    FOREIGN KEY (`username`) REFERENCES `utenti` (`username`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `recensioni` (`idRecensione`, `username`, `testo`, `voto`) VALUES
(1, 'Chiara3', 'Ottimo soggiorno e personale gentile.', 5);

-- ---------------------------
-- menu (piatti del ristorante)
-- ---------------------------
CREATE TABLE `menu` (
  `idpiatto` int(11) NOT NULL AUTO_INCREMENT,
  `piatto` varchar(100) NOT NULL,
  `descrizionepiatto` text NOT NULL,
  `prezzopiatto` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idpiatto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `menu` (`idpiatto`, `piatto`, `descrizionepiatto`, `prezzopiatto`) VALUES
(1, 'Tagliatelle al Ragù', 'Pasta fresca all\'uovo con ragù di carne tradizionale romagnolo', 12.50),
(2, 'Passatelli in Brodo', 'Tipica pasta romagnola servita in brodo di cappone', 10.00),
(3, 'Strozzapreti con Salsiccia e Funghi', 'Pasta fresca con salsiccia locale e funghi porcini', 14.00),
(4, 'Lasagne alla Bolognese', 'Lasagne tradizionali con ragù e besciamella', 13.50),
(5, 'Cappelletti in Brodo', 'Tortellini ripieni serviti in brodo di carne', 11.00);

-- ---------------------------
-- prenotazioni_ristorante (scelta: USARE QUESTA)
-- username varchar(20) per FK
-- ---------------------------
CREATE TABLE `prenotazioni_ristorante` (
  `idtavolo` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `ospiti` int(11) NOT NULL,
  `data` date NOT NULL,
  `ora` time NOT NULL,
  PRIMARY KEY (`idtavolo`, `data`, `ora`),
  KEY `idx_pr_utente` (`username`),
  CONSTRAINT `fk_pr_utente`
    FOREIGN KEY (`username`) REFERENCES `utenti` (`username`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `prenotazioni_ristorante` (`idtavolo`, `username`, `ospiti`, `data`, `ora`) VALUES
(1, 'Mario88', 2, '2026-01-10', '20:00:00'),
(2, 'Chiara3', 3, '2026-01-12', '21:00:00');

-- ---------------------------
-- prenotazioni_spiaggia (username varchar(20) per FK)
-- ---------------------------
CREATE TABLE `prenotazioni_spiaggia` (
  `idprenotazione` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `ombrellone` varchar(10) NOT NULL,
  `datainizio` date NOT NULL,
  `datafine` date NOT NULL,
  PRIMARY KEY (`idprenotazione`),
  KEY `idx_ps_utente` (`username`),
  CONSTRAINT `fk_ps_utente`
    FOREIGN KEY (`username`) REFERENCES `utenti` (`username`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `prenotazioni_spiaggia` (`username`, `ombrellone`, `datainizio`, `datafine`) VALUES
('Chiara3', 'A12', '2026-01-12', '2026-01-12'),
('Mario88', 'B07', '2026-01-11', '2026-01-11');

COMMIT;
