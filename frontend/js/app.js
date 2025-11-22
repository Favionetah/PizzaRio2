const { createApp } = Vue;

// Importamos tus vistas
import HomeView from './views/HomeView.js';
import LoginView from './views/LoginView.js';
import RegisterView from './views/RegisterView.js'; 
import ClientView from './views/ClientView.js';
import PosView from './views/PosView.js';
import AdminCashiersView from './views/AdminCashiersView.js';
import MenuView from './views/MenuView.js';
import MyOrdersView from './views/MyOrdersView.js';
import ShowcaseView from './views/ShowcaseView.js';
import MapView from './views/MapView.js';

createApp({

    components: {
        'home-view': HomeView,
        'login-view': LoginView,
        'register-view': RegisterView,
        'client-view': ClientView,
        'pos-view': PosView,
        'admin-view': AdminCashiersView,
        'menu-view': MenuView,
        'myorders-view': MyOrdersView,
        'showcase-view': ShowcaseView,
        'map-view': MapView
    },
    data() {
        return {
            currentView: 'home-view', // Empezamos en la PORTADA (Foto 1)
            user: null
        }
    },
    methods: {
        // Función para navegar manualmente
        handleNavigation(viewName) {
            this.currentView = viewName;
        },

        // Función especial para el botón "Pide Aquí" del header
        goToLogin() {
            this.currentView = 'login-view';
        },

        // Qué hacer cuando el Login es exitoso
        handleLoginSuccess(userData) {
            this.user = userData;

            // AQUÍ ESTÁ LA LÓGICA DE REDIRECCIÓN
            // Admin va a Inicio, Cajero a POS, Cliente a ClientView
            if (this.user.role === 'Administrador') {
                this.currentView = 'home-view';
            } else if (this.user.role === 'Cajero') {
                this.currentView = 'pos-view';
            } else {
                this.currentView = 'client-view';
            }
        },

        logout() {
            this.user = null;
            localStorage.removeItem('token');
            this.currentView = 'home-view';
        }
    }
}).mount('#app');