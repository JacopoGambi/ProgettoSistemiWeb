<template>
  <div id="app-wrapper">
    
    <header class="main-header">
      <div v-if="username" class="user-pill">
        <div class="user-avatar">
          {{ username.charAt(0).toUpperCase() }}
        </div>
        <div class="user-text">
          <span class="pill-name">{{ username }}</span>
          <span class="pill-role">{{ tipo }}</span>
        </div>
      </div>

      <div class="header-brand">
        <h1>Grand Hotel Mattei</h1>
        <img src="/immagini/hotel.png" alt="Immagine Hotel Mattei" class="nav-logo">
      </div>
    
      <button class="hamburger-btn" @click="toggleMenu" :aria-expanded="isMenuOpen">
        <span class="line" :class="{ open: isMenuOpen }"></span>
        <span class="line" :class="{ open: isMenuOpen }"></span>
        <span class="line" :class="{ open: isMenuOpen }"></span>
      </button>
      
      <nav :class="{ 'menu-open': isMenuOpen }">
        <ul>
          <li><router-link to="/" @click="closeMenu">Home</router-link></li>
          <li><router-link to="/camere" @click="closeMenu">Camere</router-link></li>
          <li><router-link to="/spiaggia" @click="closeMenu">Spiaggia</router-link></li>

          <li><router-link to="/scelta-accesso" @click="closeMenu">Login</router-link></li>
          <li><router-link to="/contatti" @click="closeMenu">Contattaci</router-link></li>
          <li v-if="username"><router-link to="/prenotazioni" @click="closeMenu">Prenotazioni</router-link></li>
        </ul>
      </nav>
    </header>

    <main class="content-area">
      <router-view />
    </main>

    <footer>
      <p>Viale Bologna 5, Ravenna</p>
      <p>telefono: 0544 408783 | mail: grandhotelmattei@gmail.com</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const isMenuOpen = ref(false);
const username = ref<string | null>(null);
const tipo = ref<string | null>(null);
const route = useRoute();

const updateUserData = () => {
  username.value = localStorage.getItem('username');
  tipo.value = localStorage.getItem('tipo');
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : 'auto';
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = 'auto';
};

watch(() => route.path, () => {
  updateUserData();
});

onMounted(() => {
  updateUserData();
});
</script>