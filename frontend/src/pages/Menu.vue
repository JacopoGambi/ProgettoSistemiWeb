<template>
  <div class="menu-container">
    <h1>Il Nostro Menu</h1>
    <p class="menu-subtitle">Scopri i piatti della tradizione romagnola</p>

    <!-- Messaggi di successo/errore -->
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="menu-grid">
      <div v-for="piatto in menu" :key="piatto.idpiatto" class="menu-card">
        <!-- Modalità visualizzazione normale -->
        <div v-if="!piatto.editing">
          <h3>{{ piatto.piatto }}</h3>
          <p class="piatto-descrizione">{{ piatto.descrizionepiatto }}</p>
          <p class="piatto-prezzo"><strong>€ {{ piatto.prezzopiatto.toFixed(2) }}</strong></p>

          <!-- Pulsante modifica solo per lo staff -->
          <button 
            v-if="tipoUtente === 'dipendente'" 
            @click="startEdit(piatto)"
            class="btn-edit"
          >
            <i class="bi bi-pencil"></i> Modifica
          </button>
        </div>

        <!-- Modalità modifica (solo per staff) -->
        <div v-else class="edit-mode">
          <div class="mb-3">
          </div>

          <div class="mb-3">
            <label class="form-label">Descrizione</label>
            <textarea 
              v-model="piatto.descrizionepiatto" 
              class="form-control"
              rows="3"
              placeholder="Descrizione del piatto"
            ></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Prezzo (€)</label>
            <input 
              v-model.number="piatto.prezzopiatto" 
              type="number" 
              step="0.01"
              class="form-control"
              placeholder="Prezzo"
            >
          </div>

          <div class="edit-buttons">
            <button @click="saveEdit(piatto)" class="btn-save">
              <i class="bi bi-check-circle"></i> Salva
            </button>
            <button @click="cancelEdit(piatto)" class="btn-cancel">
              <i class="bi bi-x-circle"></i> Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { MenuItem } from '../types'

export default defineComponent({
  name: 'Menu',
  data() {
    return {
      menu: [] as MenuItem[],
      tipoUtente: localStorage.getItem('tipo'),
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    async caricaMenu() {
      try {
        const res = await axios.get('/api/mostraMenu');
        this.menu = res.data.map((item: MenuItem) => ({
          ...item,
          editing: false
        }));
      } catch (err) {
        console.error('Errore nel caricamento del menu:', err);
        this.errorMessage = 'Errore nel caricamento del menu';
      }
    },

    startEdit(piatto: MenuItem) {
      // Salva i valori originali per poter annullare
      piatto.original = {
        piatto: piatto.piatto,
        descrizionepiatto: piatto.descrizionepiatto,
        prezzopiatto: piatto.prezzopiatto
      };
      piatto.editing = true;
    },

    cancelEdit(piatto: MenuItem) {
      // Ripristina i valori originali
      if (piatto.original) {
        piatto.piatto = piatto.original.piatto;
        piatto.descrizionepiatto = piatto.original.descrizionepiatto;
        piatto.prezzopiatto = piatto.original.prezzopiatto;
      }
      piatto.editing = false;
      this.errorMessage = '';
    },

    async saveEdit(piatto: MenuItem) {
      // Validazione
      if (!piatto.descrizionepiatto || !piatto.prezzopiatto) {
        this.errorMessage = 'Tutti i campi sono obbligatori';
        return;
      }

      if (piatto.prezzopiatto <= 0) {
        this.errorMessage = 'Il prezzo deve essere maggiore di zero';
        return;
      }

      try {
        const response = await axios.put(`/api/aggiornaMenu/${piatto.idpiatto}`, {
          piatto: piatto.piatto,
          descrizionepiatto: piatto.descrizionepiatto,
          prezzopiatto: piatto.prezzopiatto
        });

        if (response.data.message) {
          this.successMessage = response.data.message;
          piatto.editing = false;
          delete piatto.original;
          
          // Rimuovi il messaggio di successo dopo 3 secondi
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      } catch (err: any) {
        console.error('Errore durante l\'aggiornamento:', err);
        this.errorMessage = err.response?.data?.message || 'Errore durante l\'aggiornamento del piatto';
      }
    }
  },
  mounted() {
    this.caricaMenu();
  }
});
</script>