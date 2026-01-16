<template>
  <div class="hotel-container">
    <h1>Le nostre Camere</h1>
    
    <div class="lista-camere">
      <div v-for="camera in camere" :key="camera.idcamera" class="camera-card">
        
        <img :src="camera.immaginecamera" :alt="camera.nomecamera" class="camera-img">
        
        <h3>{{ camera.nomecamera }}</h3>
        <p>{{ camera.descrizionecamera }}</p>
        <p><strong>Prezzo:</strong> {{ camera.prezzocamera }}€</p>

        <router-link 
          v-if="tipoUtente === 'cliente'" 
          :to="'/prenota/' + camera.idcamera" 
          class="btn-prenota"
        >
          Prenota ora
        </router-link>

        <router-link 
          v-else-if="tipoUtente === 'dipendente'" 
          :to="'/modifica-camera/' + camera.idcamera" 
          class="btn-edit"
        >
          Modifica Camera
        </router-link>

        <router-link 
          v-else 
          to="/scelta-accesso" 
          class="btn-login-prompt"
        >
          per interagire effettua il login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: "Hotel",
  data() {
    return {
      camere: [] as any[],
      tipoUtente: localStorage.getItem('tipo') 
    };
  },
  methods: {
    async caricaCamere() {
      try {
        const res = await axios.get('/api/camere');
        this.camere = res.data;
      } catch (err) {
        console.error("Errore nel caricamento delle camere:", err);
      }
    }
  },
  mounted() {
    this.caricaCamere();
  }
});
</script>