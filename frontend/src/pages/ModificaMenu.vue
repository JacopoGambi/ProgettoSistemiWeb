<script lang="ts">
  import { defineComponent } from "vue";
  import axios from "axios";
  import { Menu } from "../types";
  
  export default defineComponent({
    name: "ModificaPiatto", 
    props: {
      idpiatto: {
        type: [String, Number],
        required: true
      }
    },
    data() {
      return {
        piatto: null as Menu | null,
        caricamento: true
      };
    },
    methods: {
      caricaDati() {
        this.caricamento = true;
        axios.get("/api/aggiornaMenu")
          .then(res => {
            const trovata = res.data.find((c: Menu) => c.idpiatto == this.idpiatto);
            if (trovata) {
              this.piatto = trovata;
            }
          })
          .catch(err => {
            console.error("Errore caricamento:", err);
          })
          .finally(() => {
            this.caricamento = false;
          });
      },
      salvaModifiche() {
        if (!this.piatto) return;
  
        axios.put(`/api/piatti/${this.idpiatto}`, this.piatto)
          .then(() => {
            alert("Piatto aggiornato con successo!");
            this.$router.push('/hotel');
          })
          .catch(err => {
            console.error("Errore nel salvataggio:", err);
          });
      }
    },
    mounted() {
      this.caricaDati();
    }
  });
  </script>
  
  <template>
    <div class="edit-container">
      <div v-if="caricamento">Caricamento in corso...</div>
      
      <div v-else-if="piatto">
        <h2>Modifica Piatto ID: {{ idpiatto }}</h2>
        <div class="form">
          <label>Nome:</label>
          <input v-model="piatto.piatto" type="text" />
  
          <label>Descrizione:</label>
          <textarea v-model="piatto.descrizionepiatto"></textarea>
  
          <label>Prezzo (€):</label>
          <input v-model="piatto.prezzopiatto" type="number" />
  
          <button @click="salvaModifiche" class="btn-save">Salva Modifiche</button>
        </div>
      </div>
  
      <div v-else>
        <p>Errore: Piatto non trovato.</p>
        <router-link to="/hotel">Torna alla home</router-link>
      </div>
    </div>
  </template>