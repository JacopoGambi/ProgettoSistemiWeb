<template>
  <div class="ristorante-container">
    <header class="text-center mb-5">
      <h1>Ristorante</h1>
      <p class="ristorante-subtitle">Prenota il tuo tavolo e gusta la tradizione romagnola</p>
    </header>

    <section class="menu-section text-center mb-5">
      <h2>Il Nostro Menu</h2>
      <p>Scopri le nostre specialità fatte in casa, dai cappelletti alla piadina.</p>
      <router-link to="/menu" class="btn btn-outline-primary btn-view-menu">
        <i class="bi bi-book"></i> Visualizza Menu Completo
      </router-link>
    </section>

    <hr class="my-5">

    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <section v-if="tipoUtente" class="prenotazione-section card shadow-sm p-4">
      <h2 class="mb-4 text-center">
        <i class="bi bi-calendar-plus"></i> 
        {{ tipoUtente === 'dipendente' ? 'Nuova Prenotazione (Gestione)' : 'Prenota un Tavolo' }}
      </h2>
      
      <form @submit.prevent="creaPrenotazione" class="form-prenotazione">
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label font-weight-bold">Numero Ospiti</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-people"></i></span>
              <input 
                v-model.number="formPrenotazione.ospiti" 
                type="number" 
                class="form-control"
                placeholder="es. 4"
                required
                min="1"
                max="12"
              >
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label font-weight-bold">Data</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-calendar-event"></i></span>
              <input 
                v-model="formPrenotazione.data" 
                type="date" 
                class="form-control"
                required
                :min="dataMinima"
              >
            </div>
          </div>

          <div class="col-md-4 mb-3">
            <label class="form-label font-weight-bold">Orario</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-clock"></i></span>
              <select v-model="formPrenotazione.ora" class="form-select" required>
                <option value="" disabled>Seleziona un orario</option>
                <optgroup label="Pranzo">
                  <option value="12:00:00">12:00</option>
                  <option value="12:30:00">12:30</option>
                  <option value="13:00:00">13:00</option>
                  <option value="13:30:00">13:30</option>
                </optgroup>
                <optgroup label="Cena">
                  <option value="19:00:00">19:00</option>
                  <option value="19:30:00">19:30</option>
                  <option value="20:00:00">20:00</option>
                  <option value="20:30:00">20:30</option>
                  <option value="21:00:00">21:00</option>
                  <option value="21:30:00">21:30</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        <div class="text-center mt-4">
          <button type="submit" class="btn btn-primary btn-lg btn-prenota-tavolo px-5">
            <i class="bi bi-check-circle"></i> Conferma Prenotazione
          </button>
        </div>
      </form>
    </section>

    <section v-else class="login-prompt text-center p-5 border rounded bg-light">
      <i class="bi bi-person-lock login-icon d-block mb-3" style="font-size: 3rem; color: #6c757d;"></i>
      <h3>Accedi per prenotare</h3>
      <p>Devi essere loggato per poter prenotare un tavolo nel nostro ristorante.</p>
      <router-link to="/scelta-accesso" class="btn btn-primary mt-2">
        <i class="bi bi-box-arrow-in-right"></i> Vai alla pagina di accesso
      </router-link>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { prenotazioni_ristorante } from '../types';

export default defineComponent({
  name: 'Ristorante',
  data() {
    return {
      tipoUtente: localStorage.getItem('tipo'),
      username: localStorage.getItem('username'),
      formPrenotazione: {
        ospiti: null as number | null,
        data: '',
        ora: ''
      },
      prenotazioni: [] as prenotazioni_ristorante[],
      successMessage: '',
      errorMessage: '',
      eliminandoPrenotazione: false
    };
  },
  computed: {
    // Impedisce di prenotare nel passato
    dataMinima() {
      const oggi = new Date();
      return oggi.toISOString().split('T')[0];
    }
  },
  methods: {
    async caricaPrenotazioni() {
      if (!this.username) return;
      
      try {
        let url = '';
        if (this.tipoUtente === 'dipendente') {
          url = '/api/ristorante/tutte-prenotazioni';
        } else {
          url = `/api/ristorante/mie-prenotazioni/${this.username}`;
        }

        const response = await axios.get(url);
        this.prenotazioni = response.data;
      } catch (err) {
        console.error('Errore caricamento prenotazioni:', err);
      }
    },

    async creaPrenotazione() {
      this.errorMessage = '';
      this.successMessage = '';


      if (!this.formPrenotazione.ospiti || !this.formPrenotazione.data || !this.formPrenotazione.ora) {
        this.errorMessage = 'Compila tutti i campi obbligatori.';
        return;
      }

      try {
        const response = await axios.post('/api/ristorante/creaPrenotazioni', {
          username: this.username,
          data: this.formPrenotazione.data,
          ora: this.formPrenotazione.ora,
          ospiti: this.formPrenotazione.ospiti
        });

        if (response.data.success) {
          this.successMessage = 'Prenotazione inviata con successo!';
          
          // Reset del form
          this.formPrenotazione = {
            ospiti: null,
            data: '',
            ora: ''
          };

          // Aggiorna la lista
          await this.caricaPrenotazioni();

          // Nascondi messaggio dopo 4 secondi
          setTimeout(() => { this.successMessage = ''; }, 4000);
        }
      } catch (err: any) {
        console.error('Errore creazione prenotazione:', err);
        this.errorMessage = err.response?.data?.message || 'Errore durante la prenotazione. Riprova più tardi.';
      }
    },

    async eliminaPrenotazione(p: prenotazioni_ristorante) {
      if (!confirm(`Annullare la prenotazione del ${this.formatData(p.data)} alle ${this.formatOra(p.ora)}?`)) {
        return;
      }

      this.eliminandoPrenotazione = true;
      try {
        await axios.delete(`/api/ristorante/eliminaPrenotazione/${p.username}/${p.data}/${p.ora}`);
        
        this.successMessage = 'Prenotazione annullata.';
        await this.caricaPrenotazioni();
      } catch (err: any) {
        this.errorMessage = 'Impossibile eliminare la prenotazione.';
      } finally {
        this.eliminandoPrenotazione = false;
      }
    },

    formatData(data: string) {
      if (!data) return '';
      return new Date(data).toLocaleDateString('it-IT');
    },

    formatOra(ora: string) {
      if (!ora) return '';
      return ora.substring(0, 5);
    }
  },
  mounted() {
    if (this.tipoUtente) {
      this.caricaPrenotazioni();
    }
  }
});
</script>
