import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from './components/Home.vue';
import ArtifactSnapper from './components/ArtifactSnapper/ArtifactSnapper.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/artifactSnapper',
        name: 'artifactSnapper',
        component: ArtifactSnapper,
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;