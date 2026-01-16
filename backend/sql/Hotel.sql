-- phpMyAdmin SQL Dump
-- version 5.2.1
--
-- Database: `Hotel`
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@OLD_COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Tabella: DettagliCamera
-- --------------------------------------------------------

CREATE TABLE `DettagliCamera` (
  `idcamera` int(3) NOT NULL,
  `nomecamera` text NOT NULL,
  `descrizionecamera` varchar(200) NOT NULL,
  `imgcamera` varchar(100) NOT NULL,
  `prezzocamera` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `DettagliCamera` (`idcamera`, `nomecamera`, `descrizionecamera`, `imgcamera`, `prezzocamera`) VALUES
(1, 'Camera ordinaria', 'camera standard per due ospiti, letto matrimoniale, bagno e piccolo terrazzino', 'camera.png', 90),
(2, 'Suite Imperiale', 'Dispone di più ambienti separati, come camera da letto, soggiorno e sala da pranzo, arredati con materiali pregiati, finiture raffinate e servizi esclusivi.', 'camera2.png', 300);

-- --------------------------------------------------------
-- Tabella: prenotazioni
-- --------------------------------------------------------

CREATE TABLE `prenotazioni` (
  `idprenotazione` int(11) NOT NULL,
  `idcamera` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `datainizio` date NOT NULL,
  `datafine` date NOT NULL,
  `ospiti` int(11) NOT NULL,
  `stato` varchar(20) DEFAULT 'Confermata'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `prenotazioni` (`idprenotazione`, `idcamera`, `username`, `datainizio`, `datafine`, `ospiti`, `stato`) VALUES
(1, 1, 'Mario88', '2026-01-09', '2026-01-16', 1, 'Confermata'),
(3, 2, 'Chiara3', '2026-01-22', '2026-01-23', 3, 'Confermata');

-- --------------------------------------------------------
-- Tabella: Recensioni
-- --------------------------------------------------------

CREATE TABLE `Recensioni` (
  `idRecensione` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `testo` text NOT NULL,
  `voto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `Recensioni` (`idRecensione`, `username`, `testo`, `voto`) VALUES
(1, 'Chiara3', 'ottimo ristorante', 5);

-- --------------------------------------------------------
-- Tabella: Utenti
-- Nota: password dimensionata per hash (es. bcrypt)
-- --------------------------------------------------------

CREATE TABLE `Utenti` (
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `ruolo` varchar(20) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `Utenti` (`username`, `password`, `ruolo`, `nome`) VALUES
('Mario88', '1234', 'cliente', 'Mario Rossi'),
('Chiara3', 'password', 'cliente', 'Chiara Casali'),
('Martina1', 'password', 'dipendente', 'Martina Conficconi'),
('Jacopo2', 'password', 'dipendente', 'Jacopo Gambi');

-- --------------------------------------------------------
-- Indici
-- --------------------------------------------------------

ALTER TABLE `DettagliCamera`
  ADD PRIMARY KEY (`idcamera`);

ALTER TABLE `prenotazioni`
  ADD PRIMARY KEY (`idprenotazione`);

ALTER TABLE `Recensioni`
  ADD PRIMARY KEY (`idRecensione`);

ALTER TABLE `Utenti`
  ADD PRIMARY KEY (`username`);

-- --------------------------------------------------------
-- AUTO_INCREMENT
-- --------------------------------------------------------

ALTER TABLE `prenotazioni`
  MODIFY `idprenotazione` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `Recensioni`
  MODIFY `idRecensione` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
