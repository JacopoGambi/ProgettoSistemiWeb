<template>
  <div class="scelta-container">
    
    <div v-if="isLoggedIn" class="already-logged-box">
      <div class="status-icon-big">👤</div>
      <h2>Accesso già effettuato</h2>
      <p>Benvenuto <strong>{{ currentUser }}</strong>, sei attualmente autenticato come <strong>{{ currentRole }}</strong>.</p>
      
      <div class="scelta-actions">
        <button @click="logout" class="btn-logout-scelta">Disconnetti (Logout)</button>
        <router-link to="/" class="btn-continue">Torna alla home</router-link>
      </div>
    </div>

    <div v-else class="selection-box">
      <h1>Benvenuto al Grand Hotel Mattei</h1>
      <p>Seleziona l'area a cui vuoi accedere:</p>
      
      <div class="cards-wrapper">
        <router-link to="/login/cliente" class="access-card cliente">
          <div class="card-icon">🏨</div>
          <h3>Area Clienti</h3>
          <p>Prenota la tua camera e gestisci i tuoi soggiorni</p>
        </router-link>

        <router-link to="/login/dipendente" class="access-card staff">
          <div class="card-icon">💼</div>
          <h3>Area Staff</h3>
          <p>Gestione camere, prenotazioni e amministrazione</p>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isLoggedIn = ref(false);
const currentUser = ref<string | null>('');
const currentRole = ref<string | null>('');

const checkStatus = () => {
  const user = localStorage.getItem('username');
  const role = localStorage.getItem('tipo');
  
  if (user) {
    isLoggedIn.value = true;
    currentUser.value = user;
    currentRole.value = role;
  } else {
    isLoggedIn.value = false;
  }
};

const logout = () => {
  localStorage.clear();
  checkStatus();
  //window.location.reload();
};

onMounted(() => {
  checkStatus();
});
</script>