<script lang="ts">
    import { defineComponent, PropType } from "vue";
    import { DettagliCamera } from "../types"; 
    
    // Questo è un Componente Figlio che si aspetta di ricevere una singola Prop 'camera'
    export default defineComponent({
      props: {
        camera: { 
          type: Object as PropType<DettagliCamera>, 
          required: true 
        }
      }
    });
</script>
    
<template>
  <article class="camera-card">
    
    <img :src="'/img/' + camera.imgcamera" :alt="camera.nomecamera" />
    
    <h3>{{ camera.nomecamera }}</h3>

    <RouterLink :to="'/camera/' + camera.idcamera">Leggi tutto</RouterLink>
  
  </article>
</template>