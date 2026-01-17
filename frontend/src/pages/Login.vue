<template>
  <div class="login-container">

    <div v-if="isLoggedIn" class="logged-in-container">
      <div class="status-card">
        <div class="status-icon">✓</div>
        <h2>Sessione Attiva</h2>
        <p>Sei attualmente loggato come <strong>{{ currentUser }}</strong>.</p>
        <p class="role-display">Ruolo: {{ currentRole }}</p>

        <div class="action-buttons">
          <button @click="logout" class="btn-logout-main">Effettua Logout</button>
          <router-link to="/" class="btn-return-hotel">Torna alla home</router-link>
        </div>
      </div>
    </div>

    <div v-else class="login-box">
      <h1>{{ isRegistering ? 'Registrazione' : 'Accesso' }} {{ tipo === 'dipendente' ? 'Staff' : 'Clienti' }}</h1>
      <p class="login-subtitle">
        {{ isRegistering ? 'Crea un nuovo account' : 'Inserisci le tue credenziali per accedere ai servizi' }}
      </p>

      <div class="form-wrapper">
        <div class="input-group">
          <label>Username</label>
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="Il tuo username"
            @keyup.enter="isRegistering ? handleRegister() : handleLogin()"
          >
        </div>

        <div class="mb-3">
          <label class="form-label">Password</label>
          <div class="input-group">
            <input
              v-model="loginForm.password"
              :type="isPasswordVisible ? 'text' : 'password'"
              class="form-control"
              placeholder="La tua password"
              @keyup.enter="isRegistering ? handleRegister() : handleLogin()"
            >

            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="isPasswordVisible = !isPasswordVisible"
            >
              <i :class="isPasswordVisible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="isRegistering" class="mb-3">
          <label class="form-label">Conferma Password</label>
          <div class="input-group">
            <input
              v-model="loginForm.confirmPassword"
              :type="isPasswordVisible ? 'text' : 'password'"
              class="form-control"
              placeholder="Conferma la tua password"
              @keyup.enter="handleRegister()"
            >
          </div>
        </div>

        <button
          v-if="!isRegistering"
          @click="handleLogin"
          class="btn-login-confirm"
        >
          Accedi
        </button>

        <button
          v-else
          @click="handleRegister"
          class="btn-login-confirm"
        >
          Registrati
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-text">{{ successMessage }}</p>

        <!-- Mostra il toggle solo per i clienti -->
        <div v-if="tipo === 'cliente'" class="toggle-form">
          <p v-if="!isRegistering">
            Non hai un account?
            <a href="#" @click.prevent="toggleRegistration">Registrati qui</a>
          </p>
          <p v-else>
            Hai già un account?
            <a href="#" @click.prevent="toggleRegistration">Accedi qui</a>
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { ref } from 'vue';
// variabile reattiva. Se false --> password nascosta
const isPasswordVisible = ref(false);
// Funzione per cambiare lo stato quando si clicca sull'occhio (visualizzare la password che si sta inserendo)
const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

export default defineComponent({
  name: 'Login',
  props: ['tipo'],
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      errorMessage: '',
      successMessage: '',
      isLoggedIn: false,
      currentUser: '',
      currentRole: '',
      isPasswordVisible: false,
      isRegistering: false
    };
  },

  methods: {
    checkLoginStatus() {
      const savedUser = localStorage.getItem('username');
      const savedRole = localStorage.getItem('tipo');

      if (savedUser) {
        this.isLoggedIn = true;
        this.currentUser = savedUser;
        this.currentRole = savedRole || '';
      } else {
        this.isLoggedIn = false;
      }
    },

    toggleRegistration() {
      this.isRegistering = !this.isRegistering;
      this.errorMessage = '';
      this.successMessage = '';
      this.loginForm.username = '';
      this.loginForm.password = '';
      this.loginForm.confirmPassword = '';
    },

    async handleRegister() {
      this.errorMessage = '';
      this.successMessage = '';

      // Validazione input
      if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.confirmPassword) {
        this.errorMessage = "Inserire tutti i dati richiesti.";
        return;
      }

      if (this.loginForm.username.length < 3) {
        this.errorMessage = "L'username deve contenere almeno 3 caratteri.";
        return;
      }

      if (this.loginForm.password.length < 6) {
        this.errorMessage = "La password deve contenere almeno 6 caratteri.";
        return;
      }

      if (this.loginForm.password !== this.loginForm.confirmPassword) {
        this.errorMessage = "Le password non corrispondono.";
        return;
      }

      try {
        const response = await axios.post('/api/register', {
          username: this.loginForm.username,
          password: this.loginForm.password
        });

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
      } catch (error: any) {
        console.error("Errore durante la registrazione:", error);
        if (error.response?.status === 400) {
          this.errorMessage = "Username già in uso. Scegline un altro.";
        } else if (error.response?.status === 401) {
          this.errorMessage = "Devi prima effettuare il logout.";
        } else {
          this.errorMessage = "Errore di connessione col server.";
        }
      }
    },

    async handleLogin() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.loginForm.username || !this.loginForm.password) {
        this.errorMessage = "Inserire tutti i dati richiesti.";
        return;
      }

      try {
        const response = await axios.post('/api/login', {
          username: this.loginForm.username,
          password: this.loginForm.password,
          ruolo: this.tipo
        });

        if (response.data.success) {
          localStorage.setItem('username', response.data.user.username);
          localStorage.setItem('tipo', response.data.user.ruolo);

          // Vai alla pagina home
          this.$router.push('/');
        } else {
          this.errorMessage = "Credenziali non valide.";
        }
      } catch (error) {
        console.error("Errore durante il login:", error);
        this.errorMessage = "Credenziali non valide o errore di connessione.";
      }
    },

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
  },

  mounted() {
    this.checkLoginStatus();
  }
});
</script>

<style scoped>
.success-text {
  color: #28a745;
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
}

.toggle-form {
  margin-top: 20px;
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.toggle-form p {
  color: #666;
  font-size: 0.95rem;
}

.toggle-form a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.toggle-form a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>