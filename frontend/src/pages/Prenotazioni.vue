<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { prenotazioni } from '../types';
import { prenotazioni_ristorante } from '../types';


const listaPrenotazioni = ref<prenotazioni[]>([]);
const prenotazioniRistorante = ref<prenotazioni_ristorante[]>([]);

const username = localStorage.getItem('username');
const tipo = localStorage.getItem('tipo');

// Messaggi ristorante
const successMessageRistorante = ref('');
const errorMessageRistorante = ref('');
const eliminandoPrenotazioneRistorante = ref(false);

const caricaPrenotazioni = async () => {
  if (!username || !tipo) {
    console.error('Dati utente non trovati nel localStorage');
    return;
  }

  try {
    const res = await axios.get('/api/prenotazioni', {
      params: { username, tipo }
    });

    listaPrenotazioni.value = res.data;
  } catch (err) {
    console.error('Errore caricamento camere:', err);
  }
};

const cancellaPrenotazione = async (id: number) => {
  const messaggio =
    tipo === 'cliente'
      ? 'Vuoi davvero annullare la tua prenotazione?'
      : 'Sei sicuro di voler eliminare questa prenotazione utente?';

  if (!confirm(messaggio)) return;

  try {
    await axios.delete(`/api/prenotazioni/${id}`);
    await caricaPrenotazioni();
  } catch (err) {
    console.error('Errore cancellazione camera:', err);
  }
};

// ------------------ PRENOTAZIONI RISTORANTE (presa da Ristorante.vue) ------------------
const caricaPrenotazioniRistorante = async () => {
  try {
    if (!username || !tipo) return;

    let url = '';
    if (tipo === 'dipendente') {
      url = '/api/ristorante/tutte-prenotazioni';
    } else if (tipo === 'cliente') {
      url = `/api/ristorante/mie-prenotazioni/${username}`;
    }

    if (!url) return;

    const response = await axios.get(url);
    prenotazioniRistorante.value = response.data;
  } catch (err) {
    console.error('Errore nel caricamento delle prenotazioni ristorante:', err);
    errorMessageRistorante.value = 'Errore nel caricamento delle prenotazioni del ristorante';
  }
};

const eliminaPrenotazioneRistorante = async (p: prenotazioni_ristorante) => {
  const msg =
    tipo === 'cliente'
      ? `Vuoi davvero annullare la prenotazione del tavolo ${p.idtavolo}?`
      : `Sei sicuro di voler eliminare la prenotazione del tavolo ${p.idtavolo}?`;

  if (!confirm(msg)) return;

  eliminandoPrenotazioneRistorante.value = true;
  errorMessageRistorante.value = '';
  successMessageRistorante.value = '';

  try {
    const response = await axios.delete(
      `/api/ristorante/eliminaPrenotazioni/${p.idtavolo}/${p.data}/${p.ora}`
    );

    if (response.data?.success) {
      successMessageRistorante.value = response.data.message || 'Prenotazione eliminata con successo!';
    } else {
      successMessageRistorante.value = 'Prenotazione eliminata!';
    }

    await caricaPrenotazioniRistorante();

    setTimeout(() => {
      successMessageRistorante.value = '';
    }, 3000);
  } catch (err: any) {
    console.error("Errore nell'eliminazione della prenotazione ristorante:", err);
    errorMessageRistorante.value =
      err.response?.data?.message || "Errore durante l'eliminazione della prenotazione";
  } finally {
    eliminandoPrenotazioneRistorante.value = false;
  }
};

const formatData = (data: string) => {
  const d = new Date(data);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatOra = (ora: string) => ora.substring(0, 5);

onMounted(() => {
  caricaPrenotazioni();
  caricaPrenotazioniRistorante();
});
</script>

<template>
  <div class="prenotazioni-container">
    <h1>{{ tipo === 'cliente' ? 'Le mie Prenotazioni' : 'Gestione Tutte le Prenotazioni' }}</h1>

    <!-- CAMERE -->
    <h2 class="mt-4">Prenotazioni Camere</h2>

    <div v-if="listaPrenotazioni.length === 0" class="no-data">
      <p v-if="tipo === 'cliente'">Non hai ancora effettuato nessuna prenotazione.</p>
      <p v-else>Non ci sono prenotazioni nel sistema.</p>
      <router-link v-if="tipo === 'cliente'" to="/hotel" class="btn-primary">Prenota ora</router-link>
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

    <!-- RISTORANTE (TABella FUNZIONANTE presa da Ristorante.vue) -->
    <h2 class="mt-4">Prenotazioni Ristorante</h2>

    <div v-if="successMessageRistorante" class="alert alert-success">
      {{ successMessageRistorante }}
    </div>
    <div v-if="errorMessageRistorante" class="alert alert-danger">
      {{ errorMessageRistorante }}
    </div>

    <div v-if="prenotazioniRistorante.length === 0" class="no-data">
      <p>Nessuna prenotazione presente</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Tavolo</th>
            <th v-if="tipo === 'dipendente'">Cliente</th>
            <th>Data</th>
            <th>Ora</th>
            <th>Ospiti</th>
            <th>Azioni</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="r in prenotazioniRistorante"
            :key="`${r.idtavolo}-${r.data}-${r.ora}-${r.username}`"
          >
            <td>{{ r.idtavolo }}</td>
            <td v-if="tipo === 'dipendente'"><strong>{{ r.username }}</strong></td>
            <td>{{ formatData(r.data) }}</td>
            <td>{{ formatOra(r.ora) }}</td>
            <td>{{ r.ospiti }}</td>
            <td>
              <button
                @click="eliminaPrenotazioneRistorante(r)"
                class="btn-delete"
                :disabled="eliminandoPrenotazioneRistorante"
              >
                {{ tipo === 'cliente' ? 'Annulla' : 'Elimina' }}
              </button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

