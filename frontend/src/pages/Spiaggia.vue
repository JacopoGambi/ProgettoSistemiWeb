<template>
  <div class="spiaggia-page">
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- LEFT: calendario / filtri -->
        <aside class="col-12 col-lg-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="h5 mb-3">Scegli il periodo</h2>

              <div class="mb-3">
                <label class="form-label" for="startDate">Data inizio</label>
                <input
                  id="startDate"
                  class="form-control"
                  type="date"
                  v-model="startDate"
                  :max="endDate || undefined"
                />
              </div>

              <div class="mb-3">
                <label class="form-label" for="endDate">Data fine</label>
                <input
                  id="endDate"
                  class="form-control"
                  type="date"
                  v-model="endDate"
                  :min="startDate || undefined"
                />
              </div>

              <div class="alert alert-warning py-2 mb-3" v-if="dateError">
                {{ dateError }}
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary" :disabled="!!dateError" @click="confirmRange">
                  Conferma date
                </button>
                <button class="btn btn-outline-secondary" @click="resetAll">
                  Reset
                </button>
              </div>

              <hr class="my-4" />

              <h3 class="h6 mb-2">Legenda</h3>
              <div class="legend">
                <div class="legend-item">
                  <span class="legend-swatch swatch-free"></span>
                  <span>Libero</span>
                </div>
                <div class="legend-item">
                  <span class="legend-swatch swatch-selected"></span>
                  <span>Selezionato</span>
                </div>
                <div class="legend-item">
                  <span class="legend-swatch swatch-occupied"></span>
                  <span>Occupato</span>
                </div>
              </div>

              <div class="mt-3 small text-muted">
                Seleziona un ombrellone sulla mappa a destra.
              </div>
            </div>
          </div>
        </aside>

        <!-- RIGHT: mappa ombrelloni -->
        <section class="col-12 col-lg-9">
          <div class="beach-stage shadow-sm">
            <div class="beach-header">
              <div class="beach-title">
                <div class="fw-semibold">Spiaggia</div>
                <div class="text-muted small">
                  {{ confirmedRangeLabel }}
                </div>
              </div>
            </div>

            <!--
              NOTA: lo zoom usa transform: scale(). Un elemento trasformato NON cambia
              l'altezza “di layout”, quindi può sovrapporsi al footer.
              Per evitare che la mappa “esca” dal riquadro, applichiamo la trasformazione
              ad un layer interno dentro un viewport con overflow.
            -->
            <div class="beach-viewport">
              <div class="beach-canvas">
                <!-- mare + battigia -->
                <div class="sea"></div>
                <div class="shore"></div>

                <!-- area sabbia con ombrelloni -->
                <div class="sand">
                <div class="lifeguard" title="Postazione bagnino"></div>
                <div class="starfish" title="Stella marina"></div>

                <div class="umbrellas">
                  <template v-for="row in rows" :key="'r'+row">
                    <div class="umbrella-row">
                      <!-- blocco sinistro -->
                      <template v-for="col in leftCols" :key="'l'+row+'-'+col">
                        <button
                          class="umbrella"
                          :class="umbrellaClass(umbrellaId(row, 'L', col))"
                          :disabled="isOccupied(umbrellaId(row, 'L', col)) || !!dateError"
                          @click="selectUmbrella(umbrellaId(row, 'L', col))"
                          :title="umbrellaTooltip(umbrellaId(row, 'L', col))"
                        >
                          <UmbrellaIcon />
                          <span class="u-label">{{ umbrellaId(row, 'L', col) }}</span>
                        </button>
                      </template>

                      <!-- corridoio -->
                      <div class="walkway" aria-hidden="true"></div>

                      <!-- blocco destro -->
                      <template v-for="col in rightCols" :key="'d'+row+'-'+col">
                        <button
                          class="umbrella"
                          :class="umbrellaClass(umbrellaId(row, 'R', col))"
                          :disabled="isOccupied(umbrellaId(row, 'R', col)) || !!dateError"
                          @click="selectUmbrella(umbrellaId(row, 'R', col))"
                          :title="umbrellaTooltip(umbrellaId(row, 'R', col))"
                        >
                          <UmbrellaIcon />
                          <span class="u-label">{{ umbrellaId(row, 'R', col) }}</span>
                        </button>
                      </template>
                    </div>
                  </template>
                </div>
                </div>
              </div>
            </div>

            <div class="beach-footer">
              <div class="small">
                <span class="text-muted">Ombrellone selezionato:</span>
                <span class="fw-semibold ms-1">{{ selectedUmbrella ?? '—' }}</span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div v-if="apiError" class="text-danger small">{{ apiError }}</div>
                <div v-else-if="apiSuccess" class="text-success small">Prenotazione registrata!</div>
                <button class="btn btn-success" :disabled="!canProceed || isSaving" @click="proceed">
                  <span v-if="isSaving">Salvo...</span>
                  <span v-else>Procedi</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, defineComponent, h, ref } from 'vue';

const startDate = ref<string>('');
const endDate = ref<string>('');
const confirmedStart = ref<string>('');
const confirmedEnd = ref<string>('');

const selectedUmbrella = ref<string | null>(null);

// layout griglia (simile allo screenshot)
const rows = 9;
const leftCols = 3;
const rightCols = 6;

// ombrelloni occupati per il periodo confermato (dal backend)
const occupied = ref<Set<string>>(new Set());

const apiError = ref<string>('');
const apiSuccess = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const dateError = computed(() => {
  if (!startDate.value || !endDate.value) return '';
  if (endDate.value < startDate.value) return 'La data fine non può essere precedente alla data inizio.';
  return '';
});

const confirmedRangeLabel = computed(() => {
  if (!confirmedStart.value || !confirmedEnd.value) return 'Nessun periodo confermato';
  return `Dal ${formatDate(confirmedStart.value)} al ${formatDate(confirmedEnd.value)}`;
});

const canProceed = computed(() => {
  return !!confirmedStart.value && !!confirmedEnd.value && !dateError.value && !!selectedUmbrella.value;
});

function formatDate(iso: string) {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function confirmRange() {
  confirmedStart.value = startDate.value;
  confirmedEnd.value = endDate.value;
  // se cambio periodo, forzo reselezione
  selectedUmbrella.value = null;

  // carico occupati dal backend
  if (confirmedStart.value && confirmedEnd.value && !dateError.value) {
    fetchOccupied();
  }
}

function resetAll() {
  startDate.value = '';
  endDate.value = '';
  confirmedStart.value = '';
  confirmedEnd.value = '';
  selectedUmbrella.value = null;
  occupied.value = new Set();
  apiError.value = '';
  apiSuccess.value = false;
}

function umbrellaId(row: number, side: 'L' | 'R', col: number) {
  // ID leggibile: L1-1 oppure R1-1
  return `${side}${row}-${col}`;
}

function isOccupied(id: string) {
  return occupied.value.has(id);
}

function umbrellaClass(id: string) {
  if (isOccupied(id)) return 'occupied';
  if (selectedUmbrella.value === id) return 'selected';
  return 'free';
}

function umbrellaTooltip(id: string) {
  if (isOccupied(id)) return `${id} (occupato)`;
  if (selectedUmbrella.value === id) return `${id} (selezionato)`;
  return `${id} (libero)`;
}

function selectUmbrella(id: string) {
  if (isOccupied(id)) return;
  selectedUmbrella.value = id;
  apiError.value = '';
  apiSuccess.value = false;
}

async function fetchOccupied() {
  apiError.value = '';
  apiSuccess.value = false;
  try {
    const res = await axios.get<string[]>('/api/spiaggia/occupati', {
      params: { datainizio: confirmedStart.value, datafine: confirmedEnd.value }
    });
    occupied.value = new Set(res.data || []);
  } catch (e: any) {
    console.error(e);
    apiError.value = 'Errore nel caricamento della disponibilità.';
  }
}

async function proceed() {
  apiError.value = '';
  apiSuccess.value = false;

  const username = localStorage.getItem('username');
  if (!username) {
    apiError.value = 'Devi effettuare il login per prenotare.';
    return;
  }
  if (!selectedUmbrella.value) return;

  isSaving.value = true;
  try {
    await axios.post('/api/spiaggia/prenotazioni', {
      username,
      ombrellone: selectedUmbrella.value,
      datainizio: confirmedStart.value,
      datafine: confirmedEnd.value,
    });
    apiSuccess.value = true;

    // aggiorno occupati localmente (così diventa subito rosso)
    occupied.value = new Set([...occupied.value, selectedUmbrella.value]);
    selectedUmbrella.value = null;
  } catch (e: any) {
    console.error(e);
    const msg = e?.response?.data?.error;
    apiError.value = msg || 'Errore durante il salvataggio della prenotazione.';
  } finally {
    isSaving.value = false;
  }
}

/**
 * Icona ombrellone minimale (SVG inline) per non dipendere da librerie esterne.
 */
const UmbrellaIcon = defineComponent({
  name: 'UmbrellaIcon',
  setup() {
    return () =>
      h(
        'svg',
        { viewBox: '0 0 64 64', class: 'u-icon', 'aria-hidden': 'true' },
        [
          h('path', {
            d: 'M32 6C18 6 8 15.7 8 28h48C56 15.7 46 6 32 6Z',
            fill: 'currentColor'
          }),
          h('path', {
            d: 'M32 6v22',
            stroke: 'currentColor',
            'stroke-width': '3',
            'stroke-linecap': 'round'
          }),
          h('path', {
            d: 'M32 28v21c0 6-3 9-7 9-3 0-6-2-6-5',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '3',
            'stroke-linecap': 'round'
          })
        ]
      );
  }
});
</script>

<style scoped>
.spiaggia-page {
  background: #ffffff;
}

/* Card legenda */
.legend {
  display: grid;
  gap: 10px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.legend-swatch {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.15);
}
.swatch-free { background: #f6f7fb; }
.swatch-selected { background: #cfe6ff; }
.swatch-occupied { background: #f2c2c2; }

/* Stage mappa */
.beach-stage {
  border-radius: 14px;
  overflow: hidden;
  background: #f7f9ff;
  border: 1px solid rgba(0,0,0,0.08);
}

.beach-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}

.beach-viewport{
  position: relative;
  height: 540px;
  overflow: auto;
  background: #f2d9a9;
}

.beach-canvas {
  position: relative;
  transform-origin: top left;
  /* altezza base: quando zoomi, il viewport gestisce lo scroll */
  min-height: 540px;
  background: linear-gradient(#55c6df 0 22%, #f2d9a9 22% 100%);
}

/* mare e battigia */
.sea {
  position: absolute;
  inset: 0 0 auto 0;
  height: 22%;
}
.shore {
  position: absolute;
  left: 0;
  right: 0;
  top: 20%;
  height: 6%;
  background:
    radial-gradient(circle at 15% 30%, rgba(255,255,255,0.85) 0 38%, transparent 40%),
    radial-gradient(circle at 45% 70%, rgba(255,255,255,0.85) 0 35%, transparent 37%),
    radial-gradient(circle at 75% 30%, rgba(255,255,255,0.85) 0 40%, transparent 42%),
    rgba(255,255,255,0.55);
  filter: blur(0.3px);
}

/* sabbia */
.sand {
  position: absolute;
  inset: 24% 0 0 0;
  padding: 28px 34px 24px 34px;
}

/* decorazioni (bagnino + stella) */
.lifeguard {
  position: absolute;
  left: 70px;
  top: 18px;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #d61f1f;
  transform: rotate(14deg);
  box-shadow: 0 6px 14px rgba(0,0,0,0.18);
}
.lifeguard::before,
.lifeguard::after{
  content:'';
  position:absolute;
  inset: 8px 18px;
  background: rgba(255,255,255,0.65);
  border-radius: 6px;
}
.lifeguard::after{
  inset: 18px 8px;
}

.starfish{
  position:absolute;
  right: 90px;
  top: 18px;
  width: 34px;
  height: 34px;
  background: #ee6b4e;
  clip-path: polygon(50% 0%, 61% 28%, 92% 32%, 68% 52%, 76% 84%, 50% 66%, 24% 84%, 32% 52%, 8% 32%, 39% 28%);
  filter: drop-shadow(0 6px 10px rgba(0,0,0,0.16));
}

/* griglia ombrelloni */
.umbrellas{
  display: grid;
  gap: 12px;
  margin-top: 40px;
}
.umbrella-row{
  display: grid;
  grid-template-columns: repeat(3, 1fr) 40px repeat(6, 1fr);
  gap: 10px;
  align-items: center;
}
.walkway{
  height: 100%;
  width: 40px;
  border-radius: 10px;
  background: rgba(255,255,255,0.55);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
}

/* singolo ombrellone */
.umbrella{
  position: relative;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #f6f7fb;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  padding: 0;
}
.umbrella:hover{
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.10);
}
.umbrella:disabled{
  cursor: not-allowed;
  opacity: 0.75;
  transform: none;
}

.umbrella.free{ background: #ffffff; }
.umbrella.selected{ background: #cfe6ff; border-color: rgba(30, 97, 163, 0.35); }
.umbrella.occupied{ background: #f2c2c2; border-color: rgba(170, 40, 40, 0.35); }

.u-icon{
  width: 26px;
  height: 26px;
  opacity: 0.9;
}
.u-label{
  position: absolute;
  bottom: 5px;
  font-size: 10px;
  line-height: 1;
  opacity: 0.7;
}

/* footer */
.beach-footer{
  display:flex;
  justify-content: space-between;
  align-items:center;
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid rgba(0,0,0,0.08);
  position: relative;
  z-index: 2;
}

/* responsive */
@media (max-width: 992px){
  .beach-viewport{
    height: 520px;
  }
  .beach-canvas{
    min-height: 520px;
  }
  .umbrella{
    width: 52px;
    height: 52px;
  }
  .umbrella-row{
    grid-template-columns: repeat(3, 1fr) 34px repeat(6, 1fr);
  }
  .walkway{
    width: 34px;
  }
}
</style>
