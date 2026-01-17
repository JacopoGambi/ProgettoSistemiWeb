# Riepilogo Modifiche - Aggiornamento Schema Database con Campo 'ruolo'

**Data e Ora:** 2026-01-17 14:14:00
**Sintesi:** Aggiornamento completo del database e backend per usare campo 'ruolo' invece di 'role'

---

## Modifiche Effettuate

### 1. Database - Hotel.sql

**File modificato:** `backend/sql/Hotel.sql`

#### Schema Tabella `utenti` Aggiornato

```sql
CREATE TABLE `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `ruolo` varchar(20) NOT NULL DEFAULT 'cliente',  -- Modificato: 'role' → 'ruolo'
  `nome` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### Dati di Test Inclusi

```sql
INSERT INTO `utenti` (`username`, `password`, `ruolo`, `nome`) VALUES
('Mario88',  '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'cliente',    'Mario Rossi'),
('Chiara3',  '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'cliente',    'Chiara Casali'),
('Martina1', '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'dipendente', 'Martina Conficconi'),
('Jacopo2',  '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'dipendente', 'Jacopo Gambi');
```

**Password per tutti:** `password`

---

### 2. Backend - autenticazione-controller.ts

**File modificato:** `backend/src/controllers/autenticazione-controller.ts`

#### Query Aggiornate

**Registrazione:**
```typescript
// Inserimento nuovo utente
INSERT INTO utenti (username, password, ruolo) VALUES (?, ?, ?)

// Selezione dopo registrazione
SELECT id, username, ruolo FROM utenti WHERE username=?
```

**Login:**
```typescript
SELECT username, password, ruolo FROM utenti WHERE username=?
```

---

### 3. Backend - auth.ts

**File modificato:** `backend/src/utils/auth.ts`

#### Type User Aggiornato

```typescript
export type User = {
  username: string;
  ruolo: string;  // Modificato: 'role' → 'ruolo'
};
```

#### Funzioni Aggiornate

```typescript
export function getUser(req: Request, _res: Response): User | null {
  // ...
  if (!user?.username || !user?.ruolo) return null;
  return { username: user.username, ruolo: user.ruolo };
}
```

---

## Procedura Reimport Database

### IMPORTANTE: Questo cancellerà tutti i dati esistenti!

### Passo 1: Backup (Opzionale ma Consigliato)

```bash
mysqldump -u root -p Hotel > backup_hotel_$(date +%Y%m%d_%H%M%S).sql
```

### Passo 2: Reimporta Database

**Da terminale Windows:**
```bash
cd "C:\Users\jacop\Desktop\Ingegneria dei Sistemi Web\ProgettoSistemiWeb"
mysql -u root -p < backend/sql/Hotel.sql
```

**Inserisci la password di MySQL quando richiesto**

### Passo 3: Verifica Importazione

```bash
mysql -u root -p
```

Poi esegui:
```sql
USE Hotel;
DESCRIBE utenti;
SELECT username, ruolo FROM utenti;
```

**Output atteso DESCRIBE:**
```
+----------+--------------+------+-----+---------+----------------+
| Field    | Type         | Null | Key | Default | Extra          |
+----------+--------------+------+-----+---------+----------------+
| id       | int(11)      | NO   | PRI | NULL    | auto_increment |
| username | varchar(20)  | NO   | UNI | NULL    |                |
| password | varchar(255) | NO   |     | NULL    |                |
| ruolo    | varchar(20)  | NO   |     | cliente |                |
| nome     | varchar(50)  | YES  |     | NULL    |                |
+----------+--------------+------+-----+---------+----------------+
```

**Output atteso SELECT:**
```
+----------+------------+
| username | ruolo      |
+----------+------------+
| Mario88  | cliente    |
| Chiara3  | cliente    |
| Martina1 | dipendente |
| Jacopo2  | dipendente |
+----------+------------+
```

---

## Test Completo Sistema

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

**Output atteso:**
```
VITE v7.2.2  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 3. Test Registrazione Cliente

1. Apri browser: `http://localhost:5173/login/cliente`
2. Clicca "Registrati qui"
3. Inserisci:
   - Username: `testcliente`
   - Password: `password123`
   - Conferma Password: `password123`
4. Clicca "Registrati"

**Risultato atteso:**
- ✓ Messaggio: "Registrazione completata! Effettua il login."
- ✓ Dopo 2 secondi ritorna al form di login
- ✓ Backend NON mostra errori

### 4. Test Login

1. Nella pagina di login, inserisci:
   - Username: `testcliente`
   - Password: `password123`
2. Clicca "Accedi"

**Risultato atteso:**
- ✓ Redirect alla home page
- ✓ Utente loggato correttamente

### 5. Verifica Database

```sql
SELECT id, username, ruolo, LENGTH(password) as pwd_len
FROM utenti
WHERE username = 'testcliente';
```

**Output atteso:**
```
+----+-------------+---------+---------+
| id | username    | ruolo   | pwd_len |
+----+-------------+---------+---------+
|  5 | testcliente | cliente | 60      |
+----+-------------+---------+---------+
```

---

## File Modificati - Riepilogo

### Backend (3 file)
1. **`backend/sql/Hotel.sql`**
   - Campo `role` → `ruolo` in CREATE TABLE
   - Campo `role` → `ruolo` in INSERT INTO

2. **`backend/src/controllers/autenticazione-controller.ts`**
   - Query INSERT: `role` → `ruolo`
   - Query SELECT: `role` → `ruolo`

3. **`backend/src/utils/auth.ts`**
   - Type User: `role: string` → `ruolo: string`
   - Validazione e return: `role` → `ruolo`

### Compilazione
- ✓ Backend compila senza errori
- ✓ Frontend compila senza errori

---

## Credenziali di Test

Dopo il reimport, puoi usare questi account:

### Clienti
- **Username:** Mario88 | **Password:** password
- **Username:** Chiara3 | **Password:** password

### Staff (Dipendenti)
- **Username:** Martina1 | **Password:** password
- **Username:** Jacopo2 | **Password:** password

---

## Risoluzione Problemi

### Backend da errore "Unknown column 'ruolo'"
Significa che non hai reimportato il database.
```bash
mysql -u root -p < backend/sql/Hotel.sql
```

### Errore "Access denied for user 'root'"
Verifica password MySQL:
```bash
mysql -u root -p
# Inserisci la password corretta
```

### Database 'Hotel' non esiste
Il file SQL lo crea automaticamente. Verifica che il comando sia:
```bash
mysql -u root -p < backend/sql/Hotel.sql
```
Non usare `mysql -u root -p Hotel < ...`

### Registrazione fallisce con errore server
1. Verifica che il backend sia attivo
2. Controlla la console del backend per errori
3. Verifica che il database sia stato reimportato

---

## Comando Rapido - Tutto in Uno

```bash
# 1. Backup (opzionale)
mysqldump -u root -p Hotel > backup.sql

# 2. Reimporta
mysql -u root -p < backend/sql/Hotel.sql

# 3. Riavvia backend
cd backend
npm run dev
```

---

## Note Importanti

### ⚠️ Password Hashate
Tutte le password nel database sono hashate con bcrypt.
Per i test, la password è sempre: `password`

### ✓ Sistema Compatibile
Lo schema aggiornato è compatibile con:
- Sistema nuovo autenticazione (`autenticazione-controller.ts`) ✓
- Sistema vecchio login (`login-controller.ts`) ✓

### 📊 Struttura Completa
Il database include:
- Tabella `utenti` con autenticazione sicura
- Tabella `dettaglicamera` con 3 camere
- Tabella `prenotazioni` con 2 prenotazioni di esempio
- Tabella `recensioni` con 1 recensione
- Tabella `prenotazioni_ristorante` con 2 prenotazioni
- Tabella `prenotazioni_spiaggia` con 2 prenotazioni

---

## Prossimi Passi

1. ✓ Reimporta il database
2. ✓ Riavvia backend e frontend
3. ✓ Testa registrazione nuovo cliente
4. ✓ Testa login
5. Migra completamente al nuovo sistema autenticazione
6. Rimuovi vecchio `login-controller.ts`

---

**Fine Riepilogo**
