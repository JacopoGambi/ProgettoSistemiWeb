<script lang="ts">
  import { defineComponent } from "vue";
  import axios from "axios";
  
  export default defineComponent({
    name: "Home",
    data() {
      return {
        recensioni: [] as any[],
        nuovaRecensione: { testo: "", voto: 5 },
        username: localStorage.getItem('username') || null,
        tipo: localStorage.getItem('tipo') || null
      };
    },
    methods: {
      checkLogin() {
        this.username = localStorage.getItem('username');
        this.tipo = localStorage.getItem('tipo');
      },
      // Recupera la lista delle recensioni dal database
      getRecensioni() {
        axios.get("/api/recensioni")
          .then(res => {
            this.recensioni = res.data;
          })
          .catch(err => console.error("Errore caricamento recensioni:", err));
      },
      inviaRecensione() {
        if (!this.nuovaRecensione.testo.trim() || !this.username) return;
  
        const dati = {
          username: this.username, 
          testo: this.nuovaRecensione.testo,
          voto: this.nuovaRecensione.voto
        };
  
        axios.post("/api/recensioni", dati)
          .then(() => {
            this.nuovaRecensione.testo = ""; 
            this.getRecensioni(); 
            alert("Grazie! La tua recensione è stata pubblicata.");
          })
          .catch(err => console.error("Errore nell'invio della recensione:", err));
      }
    },
    mounted() {
      this.checkLogin();
      this.getRecensioni();
    }
  });
  </script>
  
  <template>
    <div class="home-page">
      <section class="hotel-presentation">
        <h1>Benvenuti al Grand Hotel Mattei.</h1>
        <h2>Da generazioni, un'accoglienza di tradizione ed eleganza</h2>
        
        <div class="intro-text">
          <h4>Ospitalità e Relax sulla Riviera Romagnola</h4>
          <p>
            Situato in una posizione privilegiata a pochi passi dal mare, il Grand Hotel Mattei è la scelta ideale per chi cerca il perfetto equilibrio tra comfort moderno e tradizione romagnola. Con camere eleganti, servizi di alta qualità e un'atmosfera accogliente, il nostro hotel ti offre tutto ciò di cui hai bisogno per una vacanza indimenticabile.
          </p>
        </div>
  
        <div class="features-grid">
          <article>
            <h4>La Nostra Spiaggia Privata</h4>
            <p>Dimentica lo stress e goditi il sole presso la nostra spiaggia convenzionata. Un'ampia distesa di sabbia dorata attrezzata con ombrelloni e lettini, perfetta per il relax degli adulti e il divertimento dei più piccoli in totale sicurezza.</p>
          </article>
         
          <article>
            <h4>Sapori Autentici al Ristorante</h4>
            <p>Il nostro ristorante interno ti aspetta per farti scoprire i piatti tipici della cucina locale e internazionale. Ingredienti freschi e di stagione si uniscono per offrirti un'esperienza enogastronomica d'eccellenza ogni giorno.</p>
          </article>
        </div>
      </section>

      <section class="carousel-section">
  <div id="hotelCarousel" class="carousel slide shadow rounded" data-bs-ride="carousel" data-bs-interval="3000">
    <div class="carousel-indicators">
      <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="0" class="active"></button>
      <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="1"></button>
      <button type="button" data-bs-target="#hotelCarousel" data-bs-slide-to="2"></button>
    </div>

    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="/immagini/spiaggia1.png" class="d-block w-100 carousel-img" alt="Spiaggia">
      </div>
      <div class="carousel-item">
        <img src="/immagini/ristorante.png" class="d-block w-100 carousel-img" alt="Ristorante">
      </div>
      <div class="carousel-item">
        <img src="/immagini/camera3.png" class="d-block w-100 carousel-img" alt="Camera">
      </div>
    </div>

    <button class="carousel-control-prev" type="button" data-bs-target="#hotelCarousel" data-bs-slide="prev">
      <span class="carousel-control-prev-icon"></span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#hotelCarousel" data-bs-slide="next">
      <span class="carousel-control-next-icon"></span>
    </button>
  </div>
</section>

      <hr class="section-divider" />
      
      <section class="reviews-section">
        <h3>Dicono di noi</h3>
  
        <div v-if="recensioni.length > 0" class="reviews-grid">
          <div v-for="r in recensioni" :key="r.idRecensione" class="review-card">
            <p class="reviewer-name"><strong>{{ r.username }}</strong></p>
            <p class="reviewer-stars">
              {{ "★".repeat(r.voto) }}{{ "☆".repeat(5 - r.voto) }}
            </p>
            <p class="reviewer-text">"{{ r.testo }}"</p>
          </div>
        </div>
        <p v-else class="no-reviews">Non ci sono ancora recensioni.</p>
  
        <div v-if="username && tipo === 'cliente'" class="write-review-area">
          <h4>Lascia il tuo commento</h4>
          <textarea v-model="nuovaRecensione.testo" placeholder="Raccontaci la tua vacanza..."></textarea>
          <div class="form-footer">
            <label>Voto: </label>
            <select v-model="nuovaRecensione.voto">
              <option v-for="n in 5" :key="n" :value="n">{{ n }} Stelle</option>
            </select>
            <button @click="inviaRecensione" class="btn-submit">Invia Recensione</button>
          </div>
        </div>
  
        <div v-else class="review-notice">
          <p v-if="tipo === 'dipendente'">
            Sei loggato come staff: non puoi inserire recensioni.
          </p>
          <p v-else>
            Vuoi scrivere una recensione? <router-link to="/scelta-accesso">Accedi come cliente</router-link>.
          </p>
        </div>
      </section>
    </div>
  </template>