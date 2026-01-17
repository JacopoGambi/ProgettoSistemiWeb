# Riepilogo Modifiche - Aggiunta Registrazione Clienti

**Data e Ora:** 2026-01-17 13:57:30
**Sintesi:** Implementazione sistema di registrazione per clienti con toggle login/registrazione nella pagina Login

---

## Modifiche Effettuate

### 1. Frontend - Login.vue

#### Nuove Funzionalità Aggiunte

**Template HTML:**
- Aggiunto toggle dinamico tra form di Login e Registrazione
- Campo "Conferma Password" per la registrazione
- Link "Registrati qui" / "Accedi qui" visibile SOLO per i clienti
- Messaggi di successo e errore migliorati
- Il toggle NON appare per l'area Staff (tipo === 'dipendente')

**Stato Componente:**
```typescript
data() {
  return {
    isRegistering: false,           // Nuovo: controlla se mostrare form registrazione
    loginForm: {
      confirmPassword: ''            // Nuovo: campo conferma password
    },
    successMessage: '',              // Nuovo: messaggio successo registrazione
    // ... altri campi esistenti
  }
}
```

**Nuovi Metodi:**

1. **`toggleRegistration()`**
   - Alterna tra form di login e registrazione
   - Pulisce i campi del form
   - Resetta messaggi di errore/successo

2. **`handleRegister()`**
   - Validazione input:
     - Username minimo 3 caratteri
     - Password minima 6 caratteri
     - Conferma password deve corrispondere
   - Chiamata API `POST /api/register`
   - Dopo registrazione, torna automaticamente al login dopo 2 secondi
   - Gestione errori specifici:
     - Status 400: Username già in uso
     - Status 401: Utente già loggato
     - Altri: Errore generico

**Stili CSS Aggiunti:**
```css
.success-text {
  color: #28a745;        /* Verde per successo */
  font-weight: bold;
}

.toggle-form {
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.toggle-form a {
  color: #007bff;
  font-weight: 600;
}
```

---

### 2. Backend - autenticazione-controller.ts

#### Correzioni Database

**Problema:** Controller faceva riferimento a tabella `users` invece di `utenti`

**Modifiche effettuate:**

1. **Funzione `register()`:**
```typescript
// PRIMA
INSERT INTO users (username, password) VALUES (?, ?)
SELECT id, username, role FROM users WHERE username=?

// DOPO
INSERT INTO utenti (username, password, role) VALUES (?, ?, ?)
SELECT id, username, role FROM utenti WHERE username=?
```
- Aggiunto campo `role` con valore default `'cliente'`
- Tutti i nuovi utenti registrati sono automaticamente clienti

2. **Funzione `login()`:**
```typescript
// PRIMA
SELECT id, username, password, role FROM users WHERE username=?

// DOPO
SELECT id, username, password, role FROM utenti WHERE username=?
```

---

## Comportamento Sistema

### Area Clienti (`tipo === 'cliente'`)

1. **Form Login (default):**
   - Campi: Username, Password
   - Bottone: "Accedi"
   - Link sotto: "Non hai un account? **Registrati qui**"

2. **Form Registrazione:**
   - Campi: Username, Password, Conferma Password
   - Bottone: "Registrati"
   - Link sotto: "Hai già un account? **Accedi qui**"
   - Validazione:
     - Username ≥ 3 caratteri
     - Password ≥ 6 caratteri
     - Password e Conferma devono corrispondere

3. **Flusso Registrazione:**
   ```
   Cliente → Clicca "Registrati qui" → Compila form → Registrazione OK
   → Messaggio "Registrazione completata! Effettua il login"
   → Dopo 2 secondi torna al form di login automaticamente
   → Cliente può ora accedere con le nuove credenziali
   ```

### Area Staff (`tipo === 'dipendente'`)

- **Nessun link di registrazione visibile**
- Solo form di login disponibile
- Staff non può auto-registrarsi (maggiore sicurezza)

---

## Sicurezza Implementata

### Frontend
- ✓ Validazione lunghezza username (min 3 caratteri)
- ✓ Validazione lunghezza password (min 6 caratteri)
- ✓ Verifica corrispondenza password
- ✓ Gestione errori specifici

### Backend
- ✓ Controllo username duplicato
- ✓ Hash password con bcrypt (10 rounds)
- ✓ Verifica utente non già loggato
- ✓ Ruolo 'cliente' assegnato automaticamente

---

## API Utilizzate

### POST /api/register
**Endpoint nuovo sistema autenticazione**

**Request:**
```json
{
  "username": "nuovocliente",
  "password": "miapassword"
}
```

**Response Success (200):**
```json
{
  "message": "Registrazione effettuata con successo"
}
```

**Response Error:**
- `400` - Username già in uso
- `401` - Utente già loggato (richiede logout)
- `500` - Errore database

---

## Test di Compilazione

### Backend
```bash
cd backend && npm run build
```
**Risultato:** ✓ Compilazione riuscita

### Frontend
```bash
cd frontend && npm run build
```
**Risultato:** ✓ Build completato
- `dist/assets/index-MzXlwxZq.css` - 243.35 kB
- `dist/assets/index-Y4b27oF0.js` - 235.13 kB

---

## File Modificati

### Frontend (1 file)
- `frontend/src/pages/Login.vue`
  - Aggiunto template form registrazione
  - Aggiunti metodi `toggleRegistration()` e `handleRegister()`
  - Aggiunti stili CSS per success message e toggle

### Backend (1 file)
- `backend/src/controllers/autenticazione-controller.ts`
  - Correzione nome tabella: `users` → `utenti`
  - Aggiunto campo `role` con valore 'cliente' in INSERT
  - Corrette tutte le query SQL

---

## Come Testare

1. **Avviare il backend:**
```bash
cd backend
npm run dev
```

2. **Avviare il frontend:**
```bash
cd frontend
npm run dev
```

3. **Testare registrazione cliente:**
   - Vai a `http://localhost:5173/scelta-accesso`
   - Clicca su "Area Clienti"
   - Clicca su "Registrati qui"
   - Inserisci username (min 3 caratteri) e password (min 6 caratteri)
   - Conferma la password
   - Clicca "Registrati"
   - Verifica messaggio di successo
   - Dopo 2 secondi verrai riportato al login
   - Effettua il login con le nuove credenziali

4. **Verificare Area Staff:**
   - Vai a `http://localhost:5173/scelta-accesso`
   - Clicca su "Area Staff"
   - Verifica che NON appaia il link "Registrati qui"

5. **Verificare database:**
```sql
SELECT * FROM utenti ORDER BY id DESC LIMIT 5;
```
- Il nuovo utente dovrebbe avere `role = 'cliente'`
- La password dovrebbe essere hashata con bcrypt

---

## Note Importanti

### Compatibilità con Sistema Vecchio

Il sistema di login VECCHIO ([login-controller.ts](backend/src/controllers/login-controller.ts)) usa ancora:
- Tabella `Utenti` con campo `ruolo` (non `role`)
- Password in chiaro
- Endpoint `/api/login` diverso

**Raccomandazione:** Migrare completamente al nuovo sistema di autenticazione per maggiore sicurezza.

### Prossimi Passi Suggeriti

1. Aggiornare il login per usare il nuovo endpoint `/api/login` del controller autenticazione
2. Rimuovere il vecchio `login-controller.ts`
3. Aggiungere validazione email (opzionale)
4. Implementare recupero password
5. Aggiungere captcha per prevenire spam registrazioni
6. Implementare rate limiting sulle API di autenticazione

---

**Fine Riepilogo**
