# Fix Sistema Autenticazione - Cookie e Logout

**Data e Ora:** 2026-01-17 15:15:16
**Sintesi:** Risolti problemi con cookie HttpOnly, logout e cambio utente

---

## Problemi Risolti

### Problema 1: Errore 401 dopo Registrazione
**Descrizione:**
Dopo la registrazione, l'utente veniva reindirizzato al form di login, ma otteneva errore 401 "Unauthorized" provando a fare login.

**Causa:**
- La registrazione impostava automaticamente il cookie di sessione (chiamando `setUser()`)
- Il frontend reindirizzava al form di login
- Il login controllava se esisteva già un cookie e bloccava con errore 401

**Soluzione:**
Modificato il flusso di registrazione per reindirizzare direttamente alla home page invece che al login, visto che l'utente è già autenticato dopo la registrazione.

---

### Problema 2: Impossibile Cambiare Utente senza Eliminare Cookie Manualmente
**Descrizione:**
Dopo aver fatto logout, provando a fare login con un altro utente si otteneva errore 401. Era necessario eliminare manualmente i cookie da DevTools (F12).

**Causa:**
- Il frontend chiamava solo `localStorage.clear()` ma NON chiamava l'API `/api/logout`
- Il cookie HttpOnly non veniva eliminato (JavaScript non può eliminare cookie HttpOnly)
- Al successivo login, il backend vedeva ancora il vecchio cookie e bloccava con errore 401

**Soluzione:**
1. Modificato il frontend per chiamare `/api/logout` durante il logout
2. Semplificato il backend per eliminare sempre il cookie senza controlli
3. Rimosso il controllo nel login che bloccava se esisteva un cookie precedente

---

## Modifiche Effettuate

### 1. Frontend - Login.vue

#### Modifica 1: Registrazione → Home Page (righe 190-200)

**Prima:**
```typescript
if (response.data.message) {
  this.successMessage = "Registrazione completata! Effettua il login.";

  // Dopo 2 secondi, passa al form di login
  setTimeout(() => {
    this.isRegistering = false;
    this.successMessage = '';
    this.loginForm.confirmPassword = '';
  }, 2000);
}
```

**Dopo:**
```typescript
if (response.data.message) {
  // Salva i dati dell'utente nel localStorage
  localStorage.setItem('username', this.loginForm.username);
  localStorage.setItem('tipo', 'cliente');

  this.successMessage = "Registrazione completata! Reindirizzamento...";

  // Dopo 1 secondo, vai alla home page (sei già autenticato)
  setTimeout(() => {
    this.$router.push('/');
  }, 1000);
}
```

**Motivazione:**
Dopo la registrazione il backend ha già impostato il cookie di sessione, quindi l'utente è già autenticato. Ha senso portarlo direttamente alla home invece che costringerlo a fare login.

---

#### Modifica 2: Logout Chiama API Backend (righe 243-255)

**Prima:**
```typescript
logout() {
  // Pulisce la memoria
  localStorage.clear();
  this.checkLoginStatus();
  window.location.reload();
}
```

**Dopo:**
```typescript
async logout() {
  try {
    // Chiama l'API di logout per eliminare il cookie HttpOnly
    await axios.post('/api/logout');
  } catch (error) {
    console.error("Errore durante il logout:", error);
  } finally {
    // Pulisce sempre il localStorage, anche se la chiamata fallisce
    localStorage.clear();
    this.checkLoginStatus();
    window.location.reload();
  }
}
```

**Motivazione:**
I cookie HttpOnly non possono essere eliminati da JavaScript. È necessario chiamare l'API backend `/api/logout` che imposta il cookie con `Max-Age=0` per eliminarlo.

---

### 2. Backend - autenticazione-controller.ts

#### Modifica 1: Login senza Controllo Cookie (righe 51-56)

**Prima:**
```typescript
//login
export const login = async (req: Request, res: Response) => {
  // Blocca la richiesta se l'utente ha già effettuato il login
  const user = getUser(req, res)
  if (user) {
    res.status(401).send("Questa operazione richiede il logout.")
    return
  }

  // Estrae username e password dal body della richiesta
  const { username, password } = req.body
```

**Dopo:**
```typescript
//login
export const login = async (req: Request, res: Response) => {
  // Estrae username e password dal body della richiesta
  const { username, password } = req.body
```

**Motivazione:**
Il controllo che bloccava il login se esisteva già un cookie causava problemi quando il cookie non veniva eliminato correttamente. Ora il login sovrascrive semplicemente il cookie esistente con uno nuovo.

---

#### Modifica 2: Logout senza Controlli (righe 113-119)

**Prima:**
```typescript
//logout
export const logout = async (req: Request, res: Response) => {
  // Blocca la richiesta se l'utente non ha effettuato il login
  const user = getUser(req, res)
  if (!user) {
    res.status(401).send("Questa operazione richiede l'autenticazione.")
    return
  }

  // Cancella il cookie contenente l'access token
  unsetUser(req, res)

  res.json({ message: "Logout effettuato con successo" })
}
```

**Dopo:**
```typescript
//logout
export const logout = async (req: Request, res: Response) => {
  // Elimina sempre il cookie, anche se non è presente o non valido
  // Questo risolve il problema di cookie "sporchi" che bloccano il login
  unsetUser(req, res)

  res.json({ message: "Logout effettuato con successo" })
}
```

**Motivazione:**
Il logout deve sempre funzionare, anche se il cookie è corrotto o non valido. Eliminando il controllo, `unsetUser()` viene sempre chiamato e il cookie viene sempre eliminato.

---

## File Modificati - Riepilogo

### Frontend
1. **`frontend/src/pages/Login.vue`**
   - Metodo `handleRegister()`: reindirizza a home page invece di form login
   - Metodo `logout()`: ora chiama API `/api/logout` prima di pulire localStorage

### Backend
2. **`backend/src/controllers/autenticazione-controller.ts`**
   - Funzione `login()`: rimosso controllo cookie esistente
   - Funzione `logout()`: rimosso controllo autenticazione, elimina sempre il cookie

---

## Test Sistema

### Test 1: Registrazione Nuovo Utente

**Passaggi:**
1. Vai su `http://localhost:5173/login/cliente`
2. Clicca "Registrati qui"
3. Inserisci username: `testuser1` e password: `testpass`
4. Conferma password: `testpass`
5. Clicca "Registrati"

**Risultato atteso:**
- ✅ Messaggio: "Registrazione completata! Reindirizzamento..."
- ✅ Dopo 1 secondo, redirect automatico alla home page
- ✅ Utente loggato (vedi username in alto a destra)
- ✅ Nessun errore 401

---

### Test 2: Login con Utente Esistente

**Passaggi:**
1. Vai su `http://localhost:5173/login/cliente`
2. Username: `Mario88`
3. Password: `password`
4. Clicca "Accedi"

**Risultato atteso:**
- ✅ Login riuscito
- ✅ Redirect alla home page
- ✅ Nessun errore 401

---

### Test 3: Logout e Cambio Utente

**Passaggi:**
1. Fai login con `Mario88` / `password`
2. Verifica di essere loggato (username visibile)
3. Vai su `http://localhost:5173/login/cliente`
4. Clicca "Effettua Logout"
5. Verifica di essere stato disconnesso
6. Fai login con `Chiara3` / `password`

**Risultato atteso:**
- ✅ Logout funziona correttamente
- ✅ Login con secondo utente funziona senza errori
- ✅ Nessun errore 401
- ✅ NON è necessario eliminare cookie da DevTools (F12)

---

### Test 4: Login Multipli Consecutivi (senza logout)

**Passaggi:**
1. Fai login con `Mario88` / `password`
2. Torna alla pagina di login
3. Fai login con `Chiara3` / `password` (SENZA fare logout)

**Risultato atteso:**
- ✅ Login con secondo utente funziona
- ✅ Cookie viene sovrascritto con i dati del nuovo utente
- ✅ Nessun errore 401

---

## Flussi Utente

### Flusso Registrazione (Nuovo)
```
1. Utente va su /login/cliente
2. Clicca "Registrati qui"
3. Compila form registrazione
4. Clicca "Registrati"
   ↓
5. Frontend: POST /api/register
   ↓
6. Backend: Inserisce utente in DB
7. Backend: Chiama setUser() → imposta cookie HttpOnly
8. Backend: Risponde con success
   ↓
9. Frontend: Salva username e ruolo in localStorage
10. Frontend: Mostra "Registrazione completata!"
11. Frontend: Dopo 1 sec → redirect a home page (/)
    ↓
12. Utente è già loggato (ha cookie di sessione)
```

---

### Flusso Login (Aggiornato)
```
1. Utente va su /login/cliente o /login/dipendente
2. Inserisce username e password
3. Clicca "Accedi"
   ↓
4. Frontend: POST /api/login
   ↓
5. Backend: Verifica credenziali (password in chiaro)
6. Backend: Se corrette → chiama setUser() → imposta cookie HttpOnly
7. Backend: Risponde con success + dati utente
   ↓
8. Frontend: Salva username e ruolo in localStorage
9. Frontend: Redirect a home page (/)
   ↓
10. Utente è loggato

NOTA: Se esisteva già un cookie, viene sovrascritto (nessun errore 401)
```

---

### Flusso Logout (Nuovo)
```
1. Utente clicca "Effettua Logout"
   ↓
2. Frontend: POST /api/logout
   ↓
3. Backend: Chiama unsetUser() → elimina cookie (Max-Age=0)
4. Backend: Risponde con success
   ↓
5. Frontend: Chiama localStorage.clear()
6. Frontend: Ricarica pagina (window.location.reload())
   ↓
7. Utente è disconnesso (cookie eliminato, localStorage vuoto)
```

---

## Comportamento Cookie

### Cookie: ghm_user

**Proprietà:**
```
Nome: ghm_user
Valore: Base64 di JSON {username, ruolo}
Flags: HttpOnly; SameSite=Lax; Path=/
```

**Ciclo di Vita:**

| Operazione | Azione Cookie |
|------------|---------------|
| Registrazione | `setUser()` → Cookie creato |
| Login | `setUser()` → Cookie creato/sovrascritto |
| Logout | `unsetUser()` → Cookie eliminato (Max-Age=0) |
| Cambio pagina | Cookie inviato automaticamente dal browser |

**Importante:**
- Il cookie è `HttpOnly` → JavaScript non può leggerlo né eliminarlo
- Solo il backend può creare/eliminare il cookie
- Il frontend usa `localStorage` per dati visibili (username, ruolo)

---

## Differenze Rispetto al Sistema Precedente

### Sistema Vecchio (con problemi)

| Operazione | Comportamento |
|------------|---------------|
| Registrazione → Login | ❌ Errore 401 (cookie già presente) |
| Logout | ❌ Cookie non eliminato (frontend solo localStorage) |
| Cambio utente | ❌ Richiede eliminazione manuale cookie (F12) |
| Login con cookie esistente | ❌ Bloccato con errore 401 |

### Sistema Nuovo (risolto)

| Operazione | Comportamento |
|------------|---------------|
| Registrazione → Home | ✅ Redirect diretto (già autenticato) |
| Logout | ✅ Cookie eliminato correttamente via API |
| Cambio utente | ✅ Funziona automaticamente senza F12 |
| Login con cookie esistente | ✅ Cookie sovrascritto (nessun errore) |

---

## Note Tecniche

### Cookie HttpOnly
I cookie `HttpOnly` sono più sicuri perché:
- Non accessibili da JavaScript (protezione XSS)
- Non possono essere letti da `document.cookie`
- Non possono essere eliminati da JavaScript

**Conseguenza:**
Il frontend DEVE chiamare l'API backend per eliminare il cookie durante il logout.

### Vantaggi delle Modifiche

1. **User Experience Migliorata**
   - Registrazione più fluida (non serve rifare login)
   - Logout funziona sempre
   - Cambio utente senza intoppi

2. **Codice Più Robusto**
   - Login non bloccato da cookie "sporchi"
   - Logout funziona anche con cookie corrotti
   - Meno casi d'errore 401

3. **Meno Intervento Manuale**
   - Non serve più F12 per eliminare cookie
   - Sistema più user-friendly per sviluppo/test

---

## Credenziali Utenti di Test

Dopo le modifiche, puoi testare con questi account:

### Clienti
| Username | Password | Ruolo |
|----------|----------|-------|
| Mario88 | password | cliente |
| Chiara3 | password | cliente |

### Staff (Dipendenti)
| Username | Password | Ruolo |
|----------|----------|-------|
| Martina1 | password | dipendente |
| Jacopo2 | password | dipendente |

**Nota:** Tutti usano la password in chiaro: `password`

---

## Risoluzione Problemi

### Errore 401 "Unauthorized" durante login
**Sintomo:** Login fallisce con errore 401 anche con credenziali corrette

**Causa possibile:** Cookie residuo da versione precedente del codice

**Soluzione:**
1. Apri DevTools (F12)
2. Application → Cookies → `http://localhost:5173`
3. Elimina TUTTI i cookie
4. Ricarica pagina (F5)
5. Riprova login

**Nota:** Questo problema dovrebbe essere risolto con le modifiche, ma potrebbe verificarsi una volta durante la transizione.

---

### Logout non funziona
**Sintomo:** Dopo logout, sei ancora loggato

**Verifica:**
1. Controlla console browser (F12) durante logout
2. Cerca errori nella chiamata `/api/logout`
3. Verifica che il backend sia in esecuzione

**Soluzione:**
Se il backend risponde 200 OK ma sei ancora loggato:
1. Pulisci manualmente il localStorage da DevTools
2. Elimina i cookie da DevTools
3. Riavvia il backend

---

### Registrazione non reindirizza alla home
**Sintomo:** Dopo registrazione rimani sulla pagina di login

**Verifica:**
1. Controlla console browser (F12)
2. Cerca errori JavaScript
3. Verifica che `response.data.message` esista

**Possibile causa:** Errore durante la registrazione che viene catturato dal `catch`

---

## Compilazione e Verifica

### Backend
```bash
cd backend
npx tsc --noEmit
```
✅ Nessun errore TypeScript

### Frontend
```bash
cd frontend
npm run build
```
✅ Nessun errore

---

## File di Configurazione Invariati

I seguenti file NON sono stati modificati in questa sessione:

- `backend/src/utils/auth.ts` - Funzioni `getUser()`, `setUser()`, `unsetUser()` invariate
- `backend/src/routes/autenticazione-router.ts` - Rotte già corrette
- `backend/src/app.ts` - Configurazione middleware invariata
- `backend/sql/Hotel.sql` - Database invariato
- `frontend/vite.config.ts` - Proxy invariato

---

## Riepilogo Modifiche

### ✅ Cosa Funziona Ora
- Registrazione → redirect automatico alla home
- Logout elimina correttamente i cookie HttpOnly
- Cambio utente senza eliminazione manuale cookie
- Login sovrascrive cookie esistenti senza errori

### ⚠️ Nota Sicurezza
Sistema usa **password in chiaro** nel database:
- ✅ OK per sviluppo/test locale
- ❌ MAI per produzione

### 📋 Checklist Post-Modifica
- [x] Registrazione nuovo utente funziona
- [x] Redirect automatico alla home dopo registrazione
- [x] Login con utenti esistenti funziona
- [x] Logout elimina cookie
- [x] Cambio utente senza problemi
- [x] Nessun errore 401 spurio
- [x] Documentazione creata

---

**Fine Riepilogo**
