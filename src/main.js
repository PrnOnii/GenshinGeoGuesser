import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';
import 'jquery/dist/jquery.min';
import 'popper.js/dist/popper.min';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

import Vue from 'vue'
import Moment from 'vue-moment';

import router from './router';
import App from './App.vue';

Vue.use(Moment);
Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')