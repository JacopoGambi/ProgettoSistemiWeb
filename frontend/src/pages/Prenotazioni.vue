<template>
  <div class="prenotazioni-container">
    <h1>{{ tipo === 'cliente' ? 'Le mie Prenotazioni' : 'Gestione Tutte le Prenotazioni' }}</h1>

    <div v-if="listaPrenotazioni.length === 0" class="no-data">
      <p v-if="tipo === 'cliente'">Non hai ancora effettuato nessuna prenotazione.</p>
      <p v-else>Non ci sono prenotazioni nel sistema.</p>
      <router-link v-if="tipo === 'cliente'" to="/camere" class="btn-primary">Prenota ora</router-link>
    </div>

    <div v-else class="tabella-prenotazioni">
      <table>
        <thead>
          <tr>
            <th v-if="tipo !== 'cliente'">Cliente</th>
            <th>Camera</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Ospiti</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in listaPrenotazioni" :key="p.idprenotazione">
            <td v-if="tipo !== 'cliente'"><strong>{{ p.username }}</strong></td>
            
            <td>Camera #{{ p.idcamera }}</td>
            
            <td>{{ new Date(p.datainizio).toLocaleDateString('it-IT') }}</td>
            <td>{{ new Date(p.datafine).toLocaleDateString('it-IT') }}</td>
            
            <td>{{ p.ospiti }}</td>
            <td>
              <button @click="cancellaPrenotazione(p.idprenotazione)" class="btn-delete">
                {{ tipo === 'cliente' ? 'Annulla' : 'Elimina' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const listaPrenotazioni = ref<any[]>([]);

const username = localStorage.getItem('username');
const tipo = localStorage.getItem('tipo');

const caricaPrenotazioni = async () => {
  if (!username || !tipo) {
    console.error("Dati utente non trovati nel localStorage");
    return;
  }

  try {
    // in base al ruolo il backend mostra certe cose
    const res = await axios.get('/api/prenotazioni', {
      params: { 
        username: username,
        tipo: tipo 
      }
    });

    listaPrenotazioni.value = res.data;
    console.log("Dati ricevuti:", res.data);
  } catch (err) {
    console.error("Errore nel caricamento:", err);
  }
};

const cancellaPrenotazione = async (id: number) => {
  const messaggio = tipo === 'cliente' 
    ? "Vuoi davvero annullare la tua prenotazione?" 
    : "Sei sicuro di voler eliminare questa prenotazione utente?";

  if (!confirm(messaggio)) return;

  try {
    await axios.delete(`/api/prenotazioni/${id}`);
    await caricaPrenotazioni(); 
  } catch (err) {
    console.error("Errore cancellazione:", err);
  }
};

onMounted(() => {
  caricaPrenotazioni();
});
</script>

