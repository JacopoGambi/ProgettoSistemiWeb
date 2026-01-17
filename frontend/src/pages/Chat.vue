<script setup lang="ts">
import { io } from 'socket.io-client';
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
    ruolo: String 
});

//connessione utente
const message = document.querySelector('#m');
const socket = io()
const chatMessages = ref<any[]>([])
const connectedUsers = ref([]);
const writingUsers = ref([]);
const typingUsers = ref([]);
const newMessage = ref("");
const isConnected = ref(false);
const username = ref(" ");

//connessione
const handleConnect = () => {
  if (username.value.length > 0) {
    socket.emit("nuovo utente", username.value); 
    isConnected.value = true;
  }
};

//invio messaggio 
const sendMessage = () => {
  if (newMessage.value.length > 0) {
    socket.emit('chat', { user: username.value, message: newMessage.value }); 
    newMessage.value = '';
  }
};

//sta scrivendo...
const startTyping = () => socket.emit('sta scrivendo', username.value);

//scrittura
const typingNotice = computed(() => {
  const others = typingUsers.value.filter(u => u !== username.value);
  if (others.length === 0) return "";
  if (others.length === 1) return others[0] + " sta scrivendo...";
  return others.join(", ") + " stanno scrivendo...";
});

onMounted(() => {
  // Listener 
  socket.on('chat', (msg) => {chatMessages.value.push(msg);
  }); 

  //utente che sta scrivendo
  socket.on('utente che sta scrivendo', (users) => {
    typingUsers.value = users;
  });

});
</script>

<template>
    <div class="chat-container">
        <div class="chat-header">
            <h1 v-if="ruolo === 'cliente'">Contatta la Struttura</h1>
            <h1 v-else-if="ruolo === 'dipendente'">Rispondi ai Clienti</h1>
        </div>
    </div>
</template>