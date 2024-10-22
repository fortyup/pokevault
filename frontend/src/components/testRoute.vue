<script>
export default {
  data() {
    return {
      apireturn: ''
    };
  },
  mounted() {
    // Exemple d'utilisation de la route /api/card/:id avec fetch
    const getCardData = async (cardId) => {
      try {
        const response = await fetch(`http://localhost:3000/api/card/${cardId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.apireturn = data;  // Mettre à jour apireturn avec les données récupérées
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    }
    getCardData('sv6-214');
  }
};
</script>

<template>
  <div>
    <pre>{{ apireturn }}</pre>
  </div>
</template>
