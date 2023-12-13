import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

export const router = new Router({
    mode: 'history',
    base: process.env.NODE_ENV === 'production'
        ? '/rockpaperscissors/'
        : '/',
    routes: [
        {
            path: '/',
            name: 'Home',
            component: () => import('./views/Home')
        },
        {
            path: '/about',
            name: 'About',
            component: () => import('./views/About')
        },
        {
            path: '/info',
            name: 'Info',
            component: () => import('./views/Info')
        }
    ]
})

export default router;