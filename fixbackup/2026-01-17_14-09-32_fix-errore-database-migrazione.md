# Riepilogo Modifiche - Fix Errore Database e Script Migrazione

**Data e Ora:** 2026-01-17 14:09:32
**Sintesi:** Creazione script di migrazione database per risolvere errore "Unknown column 'role'" durante registrazione

---

## Problema Riscontrato

### Errore Backend
```
Error: Unknown column 'role' in 'field list'
errno: 1054
sql: 'INSERT INTO utenti (username, password, role) VALUES (?, ?, ?)'
```

### Causa
Il database MySQL non è stato aggiornato con il nuovo schema. La tabella `utenti` ha ancora:
- Campo `ruolo` invece di `role`
- Campo `password` varchar(8) invece di varchar(255)
- Manca campo `id` auto-increment

---

## Soluzioni Implementate

### 1. Script di Migrazione Database

**File creato:** `backend/sql/migrazione_utenti.sql`

Script SQL che aggiorna la tabella `utenti` mantenendo i dati esistenti:

```sql
USE Hotel;

-- Aggiunge campo id auto-increment
ALTER TABLE `utenti`
ADD COLUMN `id` int(11) NOT NULL AUTO_INCREMENT FIRST,
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `username` (`username`);

-- Rinomina ruolo in role
ALTER TABLE `utenti`
CHANGE COLUMN `ruolo` `role` varchar(20) NOT NULL DEFAULT 'cliente';

-- Espande password per bcrypt
ALTER TABLE `utenti`
MODIFY COLUMN `password` varchar(255) NOT NULL;

-- Rende nome nullable
ALTER TABLE `utenti`
MODIFY COLUMN `nome` varchar(50) DEFAULT NULL;

-- Aggiunge indice username
ALTER TABLE `utenti`
ADD INDEX `idx_username` (`username`);
```

**Caratteristiche:**
- Mantiene i dati esistenti
- Aggiorna solo la struttura della tabella
- Compatibile con dati in uso

---

### 2. Documentazione Completa

**File creato:** `backend/sql/ISTRUZIONI_MIGRAZIONE.md`

Guida dettagliata con 3 soluzioni:

#### Soluzione A: Migrazione (mantiene dati)
```bash
mysql -u root -p Hotel < backend/sql/migrazione_utenti.sql
```

#### Soluzione B: Reimportazione completa (cancella tutto)
```bash
mysql -u root -p < backend/sql/Hotel.sql
```

#### Soluzione C: Manuale (MySQL Workbench/phpMyAdmin)
Comandi SQL da eseguire passo-passo nell'interfaccia grafica

---

## Procedura Raccomandata

### Per Database con Dati Importanti

1. **Backup del database:**
```bash
mysqldump -u root -p Hotel > backup_hotel_$(date +%Y%m%d).sql
```

2. **Esegui migrazione:**
```bash
mysql -u root -p Hotel < backend/sql/migrazione_utenti.sql
```

3. **Aggiorna password esistenti:**
```sql
-- Hash di "password" per tutti gli utenti
UPDATE utenti
SET password = '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG'
WHERE LENGTH(password) < 50;
```

4. **Verifica struttura:**
```sql
DESCRIBE utenti;
```

### Per Database di Test/Sviluppo

1. **Reimporta tutto:**
```bash
mysql -u root -p < backend/sql/Hotel.sql
```

2. **Riavvia il backend:**
```bash
cd backend
npm run dev
```

3. **Testa la registrazione**

---

## Schema Database Aggiornato

### Prima della Migrazione
```sql
CREATE TABLE `utenti` (
  `username` varchar(20) NOT NULL PRIMARY KEY,
  `password` varchar(8) NOT NULL,
  `ruolo` varchar(20) NOT NULL,
  `nome` varchar(50) NOT NULL
);
```

### Dopo la Migrazione
```sql
CREATE TABLE `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'cliente',
  `nome` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
);
```

---

## Verifica Migrazione Riuscita

### Comando Verifica
```sql
USE Hotel;
DESCRIBE utenti;
```

### Output Atteso
```
+----------+--------------+------+-----+---------+----------------+
| Field    | Type         | Null | Key | Default | Extra          |
+----------+--------------+------+-----+---------+----------------+
| id       | int(11)      | NO   | PRI | NULL    | auto_increment |
| username | varchar(20)  | NO   | UNI | NULL    |                |
| password | varchar(255) | NO   |     | NULL    |                |
| role     | varchar(20)  | NO   |     | cliente |                |
| nome     | varchar(50)  | YES  |     | NULL    |                |
+----------+--------------+------+-----+---------+----------------+
```

---

## Test Post-Migrazione

### 1. Avvia Backend
```bash
cd backend
npm run dev
```

**Output atteso:**
```
Server attivo su http://localhost:3000
```

### 2. Avvia Frontend
```bash
cd frontend
npm run dev
```

### 3. Testa Registrazione

1. Vai su `http://localhost:5173/login/cliente`
2. Clicca "Registrati qui"
3. Compila:
   - Username: `testuser`
   - Password: `testpass123`
   - Conferma Password: `testpass123`
4. Clicca "Registrati"

**Risultato atteso:**
- ✓ Messaggio: "Registrazione completata! Effettua il login."
- ✓ Dopo 2 secondi torna al form di login
- ✓ Backend non da errori

### 4. Verifica Database

```sql
SELECT id, username, role, LENGTH(password) as pwd_length
FROM utenti
WHERE username = 'testuser';
```

**Output atteso:**
```
+----+----------+---------+------------+
| id | username | role    | pwd_length |
+----+----------+---------+------------+
| 5  | testuser | cliente | 60         |
+----+----------+---------+------------+
```

---

## File Creati

1. **`backend/sql/migrazione_utenti.sql`**
   - Script di migrazione SQL
   - Aggiorna struttura tabella utenti
   - Mantiene dati esistenti

2. **`backend/sql/ISTRUZIONI_MIGRAZIONE.md`**
   - Guida completa 3 soluzioni
   - Comandi passo-passo
   - Troubleshooting errori comuni

---

## Risoluzione Problemi Comuni

### Errore: "Table 'Hotel' doesn't exist"
```sql
CREATE DATABASE IF NOT EXISTS Hotel;
USE Hotel;
```

### Errore: "Access denied for user 'root'"
Verifica credenziali MySQL:
```bash
mysql -u root -p
# Inserisci password quando richiesto
```

### Errore: "Column 'ruolo' doesn't exist"
La migrazione è già stata eseguita. Verifica con:
```sql
DESCRIBE utenti;
```

### Backend continua a dare errore dopo migrazione
1. Riavvia il backend (Ctrl+C e poi `npm run dev`)
2. Verifica di essere sul database corretto:
```sql
SELECT DATABASE();
```

---

## Note Importanti

### Password Hashate
Dopo la migrazione, tutte le password devono essere in formato bcrypt (60 caratteri).
Le password in chiaro non funzioneranno più con il nuovo sistema.

### Utenti di Test
Se usi la Soluzione B (reimportazione), avrai questi utenti pre-configurati:
- Mario88 / password (cliente)
- Chiara3 / password (cliente)
- Martina1 / password (dipendente)
- Jacopo2 / password (dipendente)

### Compatibilità
Lo schema aggiornato è compatibile con:
- Sistema nuovo autenticazione (`autenticazione-controller.ts`)
- ❌ NON compatibile con vecchio sistema (`login-controller.ts`)

---

## Prossimi Passi

1. ✓ Esegui una delle soluzioni di migrazione
2. ✓ Testa la registrazione
3. Migra il frontend per usare il nuovo sistema autenticazione
4. Rimuovi il vecchio `login-controller.ts`
5. Implementa logout con chiamata `/api/logout`

---

**Fine Riepilogo**
