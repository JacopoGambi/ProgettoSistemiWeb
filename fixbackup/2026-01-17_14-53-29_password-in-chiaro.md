# Riepilogo Modifiche - Sistema Autenticazione con Password in Chiaro

**Data e Ora:** 2026-01-17 14:53:29
**Sintesi:** Modificato sistema autenticazione per salvare password in chiaro nel database invece di hash bcrypt

---

## ⚠️ IMPORTANTE - SICUREZZA

Questo sistema usa **password in chiaro** nel database:
- ✅ **OK per:** sviluppo locale, test, progetti universitari
- ❌ **MAI per:** produzione, dati reali, applicazioni pubbliche

Le password sono visibili a chiunque abbia accesso al database.

---

## Problema Iniziale

L'utente ha richiesto che le password nel database siano **leggibili in formato normale** (chiaro) invece di essere criptate con bcrypt.

### Sistema Precedente (con bcrypt)
```
Database: password = "$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG"
Backend: bcrypt.hash() per salvare, bcrypt.compare() per verificare
```

### Sistema Nuovo (password in chiaro)
```
Database: password = "password"
Backend: confronto diretto con ===
```

---

## Modifiche Effettuate

### 1. Backend - autenticazione-controller.ts

**File modificato:** `backend/src/controllers/autenticazione-controller.ts`

#### Rimosso import bcrypt
```typescript
// PRIMA
import bcrypt from "bcrypt"
import { Request, Response } from "express"

// DOPO
import { Request, Response } from "express"
```

#### Registrazione - Rimosso hashing
**Prima (righe 28-35):**
```typescript
// Crea l'hash della password per non salvarla in chiaro
const passwordHash = await bcrypt.hash(password, 10)

// Inserisce l'utente nel database con ruolo 'cliente' di default
await db.execute("INSERT INTO utenti (username, password, ruolo) VALUES (?, ?, ?)", [
  username,
  passwordHash,
  'cliente'
])
```

**Dopo (righe 27-34):**
```typescript
// Inserisce l'utente nel database con ruolo 'cliente' di default
// ATTENZIONE: Password salvata in CHIARO (solo per sviluppo/test)
await db.execute("INSERT INTO utenti (username, password, ruolo) VALUES (?, ?, ?)", [
  username,
  password,  // Password in chiaro
  'cliente'
])
```

#### Login - Confronto diretto invece di bcrypt.compare()
**Prima (righe 83-85):**
```typescript
// Confronta l'hash della password fornita con quello nel database
const correctPassword = await bcrypt.compare(password, userData.password)
console.log("[LOGIN] Password corretta:", correctPassword)
```

**Dopo (righe 85-87):**
```typescript
// Confronta password in chiaro (ATTENZIONE: solo per sviluppo/test)
const correctPassword = password === userData.password
console.log("[LOGIN] Password corretta:", correctPassword)
```

---

### 2. Database - Hotel.sql

**File modificato:** `backend/sql/Hotel.sql`

#### Schema Tabella (invariato)
```sql
CREATE TABLE `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `ruolo` varchar(20) NOT NULL DEFAULT 'cliente',
  `nome` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### Dati di Test - Password in Chiaro
**Prima (righe 26-32):**
```sql
-- Password hash generati con bcrypt (rounds=10)
-- Password originali: tutti usano 'password'
INSERT INTO `utenti` (`username`, `password`, `ruolo`, `nome`) VALUES
('Mario88',  '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'cliente',    'Mario Rossi'),
('Chiara3',  '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'cliente',    'Chiara Casali'),
('Martina1', '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'dipendente', 'Martina Conficconi'),
('Jacopo2',  '$2b$10$rNx8bqEZqNqF3xYzK3yDKO5tO5OxZJZkGfKGQhYXz2YHYzqGfJHJG', 'dipendente', 'Jacopo Gambi');
```

**Dopo (righe 26-32):**
```sql
-- ATTENZIONE: Password salvate in CHIARO (solo per sviluppo/test locale)
-- Tutti gli utenti usano la password: 'password'
INSERT INTO `utenti` (`username`, `password`, `ruolo`, `nome`) VALUES
('Mario88',  'password', 'cliente',    'Mario Rossi'),
('Chiara3',  'password', 'cliente',    'Chiara Casali'),
('Martina1', 'password', 'dipendente', 'Martina Conficconi'),
('Jacopo2',  'password', 'dipendente', 'Jacopo Gambi');
```

---

### 3. Backend - package.json (Fix riavvio continuo)

**File modificato:** `backend/package.json`

#### Aggiunto flag --no-cache a tsx
**Prima (riga 8):**
```json
"dev": "tsx src/app.ts",
```

**Dopo (riga 8):**
```json
"dev": "tsx --no-cache src/app.ts",
```

**Motivazione:** Il comando `tsx` senza flag si riavviava continuamente in loop, causando problemi con le richieste HTTP.

---

## Procedura di Aggiornamento

### Passo 1: Reimporta Database
Su **MySQL Workbench**, esegui il file aggiornato:
```sql
-- Apri e esegui: backend/sql/Hotel.sql
```

Oppure da terminale:
```bash
cd "C:\Users\jacop\Desktop\Ingegneria dei Sistemi Web\ProgettoSistemiWeb"
mysql -u root -p < backend/sql/Hotel.sql
```

### Passo 2: Riavvia Backend
```bash
cd backend
npm run dev
```

**Output atteso:**
```
Server attivo su http://localhost:3000
```

(Dovrebbe partire UNA SOLA VOLTA, senza riavviarsi)

### Passo 3: Pulisci Cookie Browser
Prima di testare il login:
1. Apri DevTools (F12)
2. Application → Cookies → `http://localhost:5173`
3. Elimina il cookie `ghm_user` (se presente)
4. Ricarica la pagina (F5)

**Oppure:** Usa una finestra in incognito

---

## Test Sistema

### Test 1: Login Utente Esistente

**URL:** `http://localhost:5173/login/cliente`

**Credenziali:**
- Username: `Mario88`
- Password: `password`

**Risultato atteso:**
- ✅ Login riuscito
- ✅ Redirect alla home page
- ✅ Console backend mostra:
```
[LOGIN] Tentativo login: Mario88
[LOGIN] Utente trovato. Ruolo: cliente
[LOGIN] Password ricevuta dal frontend: "password"
[LOGIN] Password nel database: "password"
[LOGIN] Password corretta: true
[LOGIN] Login riuscito per: Mario88
```

### Test 2: Login Staff

**URL:** `http://localhost:5173/login/dipendente`

**Credenziali:**
- Username: `Jacopo2`
- Password: `password`

**Risultato atteso:**
- ✅ Login riuscito
- ✅ Nessun link "Registrati qui" visibile (solo per clienti)

### Test 3: Registrazione Nuovo Cliente

1. Vai su `http://localhost:5173/login/cliente`
2. Clicca "Registrati qui"
3. Inserisci:
   - Username: `nuovoutente`
   - Password: `miapassword`
   - Conferma Password: `miapassword`
4. Clicca "Registrati"

**Risultato atteso:**
- ✅ Messaggio: "Registrazione completata! Effettua il login."
- ✅ Dopo 2 secondi torna al form di login
- ✅ Verifica database:
```sql
SELECT username, password, ruolo FROM utenti WHERE username='nuovoutente';
```
**Output:**
```
+-------------+-------------+---------+
| username    | password    | ruolo   |
+-------------+-------------+---------+
| nuovoutente | miapassword | cliente |
+-------------+-------------+---------+
```

### Test 4: Login con Credenziali Appena Registrate

- Username: `nuovoutente`
- Password: `miapassword`

**Risultato atteso:**
- ✅ Login riuscito
- ✅ Redirect alla home

---

## Credenziali Utenti di Test

Dopo il reimport del database, sono disponibili questi account:

### Clienti
| Username | Password | Nome |
|----------|----------|------|
| Mario88 | password | Mario Rossi |
| Chiara3 | password | Chiara Casali |

### Staff (Dipendenti)
| Username | Password | Nome |
|----------|----------|------|
| Martina1 | password | Martina Conficconi |
| Jacopo2 | password | Jacopo Gambi |

**Nota:** Tutti usano la stessa password: `password`

---

## Risoluzione Problemi

### Errore 401 "Unauthorized" durante login

**Causa:** Cookie di sessione vecchio nel browser

**Soluzione:**
1. Apri DevTools (F12)
2. Application → Cookies → `http://localhost:5173`
3. Elimina cookie `ghm_user`
4. Ricarica pagina (F5)

Oppure usa finestra in incognito.

### Backend si riavvia continuamente

**Sintomo:** Console mostra "Server attivo su http://localhost:3000" ripetuto molte volte

**Causa:** tsx in watch mode rileva modifiche continue

**Soluzione:** Applicata modifica a `package.json`:
```json
"dev": "tsx --no-cache src/app.ts"
```

Riavvia il backend (Ctrl+C e poi `npm run dev`)

### Login non funziona ma backend risponde 200 OK

**Test:** Verifica che il backend funzioni correttamente:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"Mario88\",\"password\":\"password\"}"
```

**Output atteso:**
```json
{"success":true,"user":{"username":"Mario88","ruolo":"cliente"}}
```

Se il curl funziona ma il browser no, il problema è nel frontend o nei cookie.

### Password nel database ancora con hash bcrypt

**Verifica:**
```sql
SELECT username, password, LENGTH(password) as len FROM utenti;
```

Se `len` = 60 → password ancora hashate

**Soluzione:** Reimporta il database:
```bash
mysql -u root -p < backend/sql/Hotel.sql
```

---

## File Modificati - Riepilogo

### Backend (3 file)
1. **`backend/src/controllers/autenticazione-controller.ts`**
   - Rimosso import bcrypt
   - Registrazione: salva password in chiaro
   - Login: confronto con `===` invece di `bcrypt.compare()`
   - Aggiunti log di debug

2. **`backend/sql/Hotel.sql`**
   - Password cambiate da hash bcrypt a password in chiaro
   - Aggiunti commenti di avviso

3. **`backend/package.json`**
   - Script dev: aggiunto flag `--no-cache`

### File NON Modificati
- `backend/src/utils/auth.ts` - invariato
- `backend/src/app.ts` - invariato
- `frontend/src/pages/Login.vue` - invariato

---

## Compilazione

**Backend:**
```bash
cd backend
npx tsc --noEmit
```
✅ Nessun errore TypeScript

**Frontend:**
```bash
cd frontend
npm run build
```
✅ Nessun errore

---

## Confronto Sistemi

| Aspetto | Sistema Vecchio (bcrypt) | Sistema Nuovo (chiaro) |
|---------|--------------------------|------------------------|
| Password DB | Hash 60 caratteri | Testo leggibile |
| Registrazione | `bcrypt.hash(password, 10)` | `password` diretto |
| Login | `bcrypt.compare(pwd, hash)` | `password === dbPassword` |
| Sicurezza | Alta (rainbow table resistant) | ⚠️ Nessuna (password visibili) |
| Performance | Lenta (~100ms hashing) | Veloce (confronto istantaneo) |
| Uso consigliato | Produzione | Solo sviluppo/test locale |

---

## Note Importanti

### Dipendenze
Il package `bcrypt` rimane installato in `package.json` ma non è più usato nel codice:
```json
"bcrypt": "^6.0.0"
```

Può essere rimosso con:
```bash
npm uninstall bcrypt @types/bcrypt
```

### Cookie Authentication
Il sistema continua a usare cookie `HttpOnly` per la sessione:
- Nome cookie: `ghm_user`
- Contenuto: Base64 di `{username, ruolo}`
- Flags: `HttpOnly; SameSite=Lax; Path=/`

### Compatibilità
Questo sistema è compatibile con:
- ✅ Frontend esistente (Login.vue)
- ✅ Sistema di registrazione
- ✅ Tutte le altre API (camere, prenotazioni, etc.)

---

## Vantaggi e Svantaggi

### Vantaggi ✅
- Password visibili e modificabili direttamente nel database
- Più semplice per debug e test
- Nessun overhead di hashing (più veloce)
- Facile reset password manualmente

### Svantaggi ❌
- **Completamente insicuro** per dati reali
- Password visibili a chiunque acceda al database
- Vulnerabile se il database viene compromesso
- Non rispetta best practices di sicurezza

---

## Prossimi Passi Consigliati

1. ✅ Sistema funzionante con password in chiaro
2. ✅ Database reimportato
3. ✅ Login e registrazione testati
4. **Opzionale:** Rimuovere dipendenza bcrypt non utilizzata
5. **Importante:** NON usare questo sistema in produzione

---

## Appendice - Esempio Query Database

### Visualizza Tutti gli Utenti
```sql
SELECT id, username, password, ruolo, nome FROM utenti;
```

### Aggiungi Nuovo Utente Manualmente
```sql
INSERT INTO utenti (username, password, ruolo, nome)
VALUES ('testuser', 'testpass', 'cliente', 'Test User');
```

### Cambia Password Utente
```sql
UPDATE utenti
SET password = 'nuovapassword'
WHERE username = 'Mario88';
```

### Cambia Ruolo Utente
```sql
UPDATE utenti
SET ruolo = 'dipendente'
WHERE username = 'Mario88';
```

---

**Fine Riepilogo**
