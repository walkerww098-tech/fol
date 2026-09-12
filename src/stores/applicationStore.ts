import { defineStore } from "pinia";
import { ref } from "vue";

export const useApplicationStore = defineStore('application', () => {
    const drawer = ref(null)

    // -----------------------------------------------------------
    return { drawer }
});
