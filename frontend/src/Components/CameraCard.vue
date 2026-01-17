<script lang="ts">
    import { defineComponent, PropType } from "vue";
    import { dettaglicamera } from "../types"; 
    
    export default defineComponent({
      props: {
        camera: { 
          type: Object as PropType<dettaglicamera>, 
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