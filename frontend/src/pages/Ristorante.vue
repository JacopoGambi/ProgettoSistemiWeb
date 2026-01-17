<template>
  <div class="ristorante-container">
    <h1>Ristorante</h1>
    <p class="ristorante-subtitle">Prenota il tuo tavolo e gusta la tradizione romagnola</p>

    <!-- Sezione Menu -->
    <section class="menu-section">
      <h2>Il Nostro Menu</h2>
      <router-link to="/menu" class="btn-view-menu">
        <i class="bi bi-book"></i> Visualizza Menu Completo
      </router-link>
    </section>

    <!-- Messaggi -->
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <!-- Form prenotazione (solo per utenti loggati) -->
    <section v-if="tipoUtente" class="prenotazione-section">
      <h2>{{ tipoUtente === 'dipendente' ? 'Crea Prenotazione' : 'Prenota un Tavolo' }}</h2>
      
      <form @submit.prevent="creaPrenotazione" class="form-prenotazione">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Numero Tavolo</label>
            <input 
              v-model.number="formPrenotazione.idtavolo" 
              type="number" 
              class="form-control"
              placeholder="es. 1"
              required
              min="1"
            >
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Numero Ospiti</label>
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

          <div class="col-md-6 mb-3">
            <label class="form-label">Data</label>
            <input 
              v-model="formPrenotazione.data" 
              type="date" 
              class="form-control"
              required
              :min="dataMinima"
            >
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Ora</label>
            <select v-model="formPrenotazione.ora" class="form-control" required>
              <option value="">Seleziona un orario</option>
              <option value="12:00:00">12:00</option>
              <option value="12:30:00">12:30</option>
              <option value="13:00:00">13:00</option>
              <option value="13:30:00">13:30</option>
              <option value="19:00:00">19:00</option>
              <option value="19:30:00">19:30</option>
              <option value="20:00:00">20:00</option>
              <option value="20:30:00">20:30</option>
              <option value="21:00:00">21:00</option>
              <option value="21:30:00">21:30</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn-prenota-tavolo">
          <i class="bi bi-calendar-check"></i> Conferma Prenotazione
        </button>
      </form>
    </section>

    <!-- Invito al login per utenti non loggati -->
    <section v-else class="login-prompt">
      <div class="login-prompt-card">
        <i class="bi bi-person-circle login-icon"></i>
        <h3>Effettua il login per prenotare</h3>
        <p>Accedi al tuo account per prenotare un tavolo nel nostro ristorante</p>
        <router-link to="/scelta-accesso" class="btn-login-required">
          <i class="bi bi-box-arrow-in-right"></i> Vai al Login
        </router-link>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

interface Prenotazione {
  idtavolo: number;
  username: string;
  data: string;
  ora: string;
  ospiti: number;
}

export default defineComponent({
  name: 'Ristorante',
  data() {
    return {
      tipoUtente: localStorage.getItem('tipo'),
      username: localStorage.getItem('username'),
      formPrenotazione: {
        idtavolo: null as number | null,
        ospiti: null as number | null,
        data: '',
        ora: ''
      },
      prenotazioni: [] as Prenotazione[],
      successMessage: '',
      errorMessage: '',
      eliminandoPrenotazione: false
    };
  },
  computed: {
    dataMinima() {
      const oggi = new Date();
      return oggi.toISOString().split('T')[0];
    }
  },
  methods: {
    async caricaPrenotazioni() {
      try {
        let url = '';
        
        if (this.tipoUtente === 'dipendente') {
          url = '/api/ristorante/tutte-prenotazioni';
        } else if (this.tipoUtente === 'cliente') {
          url = `/api/ristorante/mie-prenotazioni/${this.username}`;
        }

        if (url) {
          const response = await axios.get(url);
          this.prenotazioni = response.data;
        }
      } catch (err) {
        console.error('Errore nel caricamento delle prenotazioni:', err);
        this.errorMessage = 'Errore nel caricamento delle prenotazioni';
      }
    },

    async creaPrenotazione() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.formPrenotazione.idtavolo || !this.formPrenotazione.ospiti || 
          !this.formPrenotazione.data || !this.formPrenotazione.ora) {
        this.errorMessage = 'Tutti i campi sono obbligatori';
        return;
      }

      if (this.formPrenotazione.ospiti < 1 || this.formPrenotazione.ospiti > 12) {
        this.errorMessage = 'Il numero di ospiti deve essere tra 1 e 12';
        return;
      }

      try {
        const response = await axios.post('/api/ristorante/creaPrenotazioni', {
          idtavolo: this.formPrenotazione.idtavolo,
          username: this.username,
          data: this.formPrenotazione.data,
          ora: this.formPrenotazione.ora,
          ospiti: this.formPrenotazione.ospiti
        });

        if (response.data.success) {
          this.successMessage = response.data.message || 'Prenotazione creata con successo!';
          
          this.formPrenotazione = {
            idtavolo: null,
            ospiti: null,
            data: '',
            ora: ''
          };

          await this.caricaPrenotazioni();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      } catch (err: any) {
        console.error('Errore nella creazione della prenotazione:', err);
        
        if (err.response?.status === 409 || err.response?.data?.message?.includes('Duplicate entry')) {
          this.errorMessage = 'Questo tavolo è già prenotato per l\'orario selezionato. Scegli un altro tavolo o un altro orario.';
        } else {
          this.errorMessage = err.response?.data?.message || 'Errore durante la creazione della prenotazione';
        }
      }
    },

    async eliminaPrenotazione(prenotazione: Prenotazione) {
      if (!confirm(`Sei sicuro di voler eliminare la prenotazione del tavolo ${prenotazione.idtavolo}?`)) {
        return;
      }

      this.eliminandoPrenotazione = true;
      this.errorMessage = '';

      try {
        const response = await axios.delete(
          `/api/ristorante/eliminaPrenotazioni/${prenotazione.idtavolo}/${prenotazione.data}/${prenotazione.ora}`
        );

        if (response.data.success) {
          this.successMessage = response.data.message || 'Prenotazione eliminata con successo!';
          await this.caricaPrenotazioni();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      } catch (err: any) {
        console.error('Errore nell\'eliminazione della prenotazione:', err);
        this.errorMessage = err.response?.data?.message || 'Errore durante l\'eliminazione della prenotazione';
      } finally {
        this.eliminandoPrenotazione = false;
      }
    },

    formatData(data: string) {
      const date = new Date(data);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatOra(ora: string) {
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

