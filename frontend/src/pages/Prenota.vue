<template>
    <div class="prenota-container">
      <h1>Seleziona le date per la Camera {{ idcamera }}</h1>
  
      <div class="calendar-wrapper">
        <div class="calendar-header">
          <button @click="cambiaMese(-1)">&lt;</button>
          <h3>{{ nomeMeseCorrente }} {{ annoCorrente }}</h3>
          <button @click="cambiaMese(1)">&gt;</button>
        </div>
  
        <div class="calendar-grid">
          <div v-for="giorno in nomiGiorni" :key="giorno" class="day-name">{{ giorno }}</div>
          
          <div v-for="vuoto in spaziIniziali" :key="'v'+vuoto" class="day-empty"></div>
  
          <div 
            v-for="giorno in giorniDelMese" 
            :key="giorno.dataStr"
            class="day-square"
            :class="{
              'today': giorno.isOggi,
              'disabled': giorno.isPassato,
              'selected': isSelezionato(giorno.dataStr),
              'in-range': isInRange(giorno.dataStr)
            }"
            @click="selezionaGiorno(giorno)"
          >
            {{ giorno.numero }}
          </div>
        </div>
      </div>
  
      <div class="booking-summary">
        <p><strong>Check-in:</strong> {{ form.datainizio || 'Seleziona sulla griglia' }}</p>
        <p><strong>Check-out:</strong> {{ form.datafine || 'Seleziona sulla griglia' }}</p>
        
        <div class="form-group">
          <label>Ospiti:</label>
          <input type="number" v-model="form.ospiti" min="1" max="4">
        </div>
  
        <div class="actions">
          <button @click="inviaPrenotazione" :disabled="!form.datafine" class="btn-confirm">
            Conferma Prenotazione
          </button>
          <router-link to="/camere" class="btn-back">Annulla</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  
  const props = defineProps(['idcamera']);
  const router = useRouter();
  
 //calendario
  const dataVisualizzata = ref(new Date());
  const nomiGiorni = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  
  const form = reactive({
    idcamera: props.idcamera,
    username: localStorage.getItem('username'),
    datainizio: '',
    datafine: '',
    ospiti: 1
  });
  
  const annoCorrente = computed(() => dataVisualizzata.value.getFullYear());
  const nomeMeseCorrente = computed(() => 
    dataVisualizzata.value.toLocaleString('it-IT', { month: 'long' }).toUpperCase()
  );
  
  const giorniDelMese = computed(() => {
    const giorni = [];
    const ultimoGiorno = new Date(annoCorrente.value, dataVisualizzata.value.getMonth() + 1, 0).getDate();
    const oggiStr = new Date().toISOString().split('T')[0];
  
    for (let i = 1; i <= ultimoGiorno; i++) {
      const data = new Date(annoCorrente.value, dataVisualizzata.value.getMonth(), i);
      const dataStr = data.toISOString().split('T')[0];
      giorni.push({
        numero: i,
        dataStr: dataStr,
        isOggi: dataStr === oggiStr,
        isPassato: dataStr < oggiStr
      });
    }
    return giorni;
  });
  
  const spaziIniziali = computed(() => {
    let primoGiornoSettimana = new Date(annoCorrente.value, dataVisualizzata.value.getMonth(), 1).getDay();
    return primoGiornoSettimana === 0 ? 6 : primoGiornoSettimana - 1; 
  });
  
 //selezione data
  const selezionaGiorno = (giorno: any) => {
    if (giorno.isPassato) return;
  
    if (!form.datainizio || (form.datainizio && form.datafine)) {
      form.datainizio = giorno.dataStr;
      form.datafine = '';
    } else if (giorno.dataStr > form.datainizio) {
      form.datafine = giorno.dataStr;
    } else {
      form.datainizio = giorno.dataStr;
    }
  };
  
  const isSelezionato = (dataStr: string) => dataStr === form.datainizio || dataStr === form.datafine;
  const isInRange = (dataStr: string) => dataStr > form.datainizio && dataStr < form.datafine;
  
  const cambiaMese = (direzione: number) => {
    dataVisualizzata.value = new Date(annoCorrente.value, dataVisualizzata.value.getMonth() + direzione, 1);
  };
  
  const inviaPrenotazione = async () => {
    try {
      const res = await axios.post('/api/prenotazioni', form);
      if (res.data.success) {
        alert("Prenotazione registrata!");
        router.push('/prenotazioni');
      }
    } catch (err) {
      alert("Errore durante la prenotazione.");
    }
  };
  </script>