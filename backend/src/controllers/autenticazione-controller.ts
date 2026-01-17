import { Request, Response } from "express"
import { getUser, setUser, unsetUser, User } from "../utils/auth"
import { db } from "../utils/db";

//registrazione 
export const register = async (req: Request, res: Response) => {
  // l'utente ha già effettuato il login
  const user = getUser(req, res)
  if (user) {
    res.status(401).send("Questa operazione richiede il logout.")
    return
  }

  // Estrae username e password dal body della richiesta
  const { username, password } = req.body

  //verifica se l'username esiste già
  const checkUser = await db.execute("SELECT username FROM utenti WHERE username=?", [username,])
  const users = checkUser[0]


  if (Array.isArray(users) && users.length > 0) {
    res.status(400).send("Username già in uso.")
    return
  }

  // Inserisce l'utente nel database con ruolo 'cliente' di default
  // ATTENZIONE: Password salvata in CHIARO (solo per sviluppo/test)
  await db.execute("INSERT INTO utenti (username, password, ruolo) VALUES (?, ?, ?)", [
    username,
    password,  // Password in chiaro
    'cliente'
  ])

  // Estrae i dati per il nuovo utente
  const [rows] = await db.execute(
    "SELECT id, username, ruolo FROM utenti WHERE username=?",
    [username]
  ) as any //cast
  const newUser = (rows as User[])[0]

  // Crea un JWT contenente i dati dell'utente e lo imposta come cookie
  //JWT è un token di autenticazione
  setUser(req, res, newUser)

  res.json({ message: "Registrazione effettuata con successo" })
}


//login
export const login = async (req: Request, res: Response) => {
  // Estrae username e password dal body della richiesta
  const { username, password } = req.body

  console.log("[LOGIN] Tentativo login:", username)

  // Esegue la query al database per ottenere i dati dell'utente in base allo username
  const [userLog] = await db.execute(
    "SELECT id, username, password, ruolo FROM utenti WHERE username=?",
    [username]
  ) as any

  // Errore se l'utente non è stato trovato
  if (!Array.isArray(userLog) || userLog.length == 0) {
    console.log("[LOGIN] Utente non trovato nel database:", username)
    res.status(400).send("Credenziali errate.")
    return
  }

  const userData = userLog[0] as any
  console.log("[LOGIN] Utente trovato. Ruolo:", userData.ruolo)
  console.log("[LOGIN] Password ricevuta dal frontend:", `"${password}"`)
  console.log("[LOGIN] Password nel database:", `"${userData.password}"`)

  // Confronta password in chiaro (ATTENZIONE: solo per sviluppo/test)
  const correctPassword = password === userData.password
  console.log("[LOGIN] Password corretta:", correctPassword)

  // Errore se la password è errata
  if (!correctPassword) {
    console.log("[LOGIN] Password errata per utente:", username)
    res.status(400).send("Credenziali errate.")
    return
  }

  console.log("[LOGIN] Login riuscito per:", username)

  // Importante! Rimuove la password dall'oggetto utente in modo da non inserirla nel JWT
  delete userData.password

  // Crea un JWT contenente i dati dell'utente e lo imposta come cookie
  setUser(req, res, userData)

  // Restituisce risposta compatibile con il frontend
  res.json({
    success: true,
    user: {
      username: userData.username,
      ruolo: userData.ruolo
    }
  })
}


//logout
export const logout = async (req: Request, res: Response) => {
  // Elimina sempre il cookie, anche se non è presente o non valido
  // Questo risolve il problema di cookie "sporchi" che bloccano il login
  unsetUser(req, res)

  res.json({ message: "Logout effettuato con successo" })
}


//mostra profilo utente
export const getProfile = async (req: Request, res: Response) => {
  // Decodifica il contenuto dell'access token, che contiene il dati dell'utente, e lo invia in risposta
  const user = getUser(req, res)
  res.json(user)
}