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
      <h1>Accesso {{ tipo === 'dipendente' ? 'Staff' : 'Clienti' }}</h1>
      <p class="login-subtitle">Inserisci le tue credenziali per accedere ai servizi</p>
      
      <div class="form-wrapper">
        <div class="input-group">
          <label>Username</label>
          <input 
            v-model="loginForm.username" 
            type="text" 
            placeholder="Il tuo username" 
            @keyup.enter="handleLogin"
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
      @keyup.enter="handleLogin"
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

        <button @click="handleLogin" class="btn-login-confirm">Accedi</button>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
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
        password: ''
      },
      errorMessage: '',
      isLoggedIn: false,
      currentUser: '',
      currentRole: '',
      isPasswordVisible: false
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
    async handleLogin() {
      this.errorMessage = "";
      
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
        this.errorMessage = "Errore di connessione col server.";
      }
    },
    logout() {
      // Pulisce la memoria
      localStorage.clear();
      this.checkLoginStatus();  
      window.location.reload();
    }
  },
  mounted() {
    this.checkLoginStatus();
  }
});
</script>