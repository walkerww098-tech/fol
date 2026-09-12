<template>
    <v-app id="inspire">
        <v-app-bar color="indigo-darken-4" height="32" dense>
            <v-app-bar-title>{{ route.meta.title }}</v-app-bar-title>
            <v-spacer></v-spacer>
            <v-app-bar-nav-icon @click="app.drawer = !app.drawer"></v-app-bar-nav-icon>
        </v-app-bar>
        <router-view></router-view>
    </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useApplicationStore } from '@/stores/applicationStore';
import { useRoute } from 'vue-router';

const app = useApplicationStore();
const route = useRoute();
</script>
<style></style>