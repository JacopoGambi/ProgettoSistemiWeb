<script lang="ts">
    import { defineComponent, PropType } from "vue";
    import { Menu } from "../types"; 
    
    export default defineComponent({
      name: "MenuCard",
      props: {
        menu: { 
          type: Object as PropType<Menu>, 
          required: true 
        }
      },
      data() {
        return {
          tipoUtente: localStorage.getItem('tipo')
        };
      }
    });
  </script>
    
  <template>
  <article class="menu-card">
    <h2>{{ menu.piatto }}</h2>
    <p>{{ menu.descrizionepiatto }}</p>
    <p>Prezzo: <strong>{{ menu.prezzopiatto }}€</strong></p>
  
    <RouterLink v-if="tipoUtente === 'staff'" :to="'/modifica-menu/' + menu.idpiatto" class="btn-link">
      Modifica Piatto
    </RouterLink>
    
    <RouterLink v-else :to="'/menu-dettaglio/' + menu.idpiatto" class="btn-link">
      Visualizza Dettagli
    </RouterLink>
  </article>
  </template>
  
  