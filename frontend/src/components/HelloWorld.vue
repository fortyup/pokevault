<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
import axios from 'axios';  // Importer Axios

export default {
  data() {
    return {
      message: ''  // Initialiser une variable pour stocker le message
    };
  },
  mounted() {
    // Effectuer une requête GET vers le serveur Express
    axios.get('http://localhost:3000/')  // URL du serveur Express
        .then(response => {
          this.message = response.data;  // Assigner le message de la réponse à la variable
        })
        .catch(error => {
          console.error("Il y a eu une erreur !", error);  // Gérer les erreurs
        });
  }
};
</script>
