import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/Home.vue";
import Camere from "../pages/Camere.vue";
import Prenotazioni from "../pages/Prenotazioni.vue";
import Recensioni from "../pages/Recensioni.vue";
import Spiaggia from "../pages/Spiaggia.vue";
import Login from "../pages/Login.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/camere", component: Camere },
    { path: "/prenotazioni", component: Prenotazioni },
    { path: "/recensioni", component: Recensioni },
    { path: "/spiaggia", component: Spiaggia },
    { path: "/login", component: Login },
  ],
});
