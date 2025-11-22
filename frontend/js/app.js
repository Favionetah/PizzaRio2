const { createApp } = Vue;

// Importamos tus vistas
import HomeView from './views/HomeView.js';
import LoginView from './views/LoginView.js';
import ClientView from './views/ClientView.js'; // (Aún no existe, lo hará la Persona 2)
import PosView from './views/PosView.js';     // (Aún no existe, lo hará la Persona 3)

createApp({
    
    components: {
        'home-view': HomeView,
        'login-view': LoginView,
        'client-view': ClientView,
        'pos-view': PosView
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
            if (this.user.role === 'Administrador' || this.user.role === 'Cajero') {
                this.currentView = 'pos-view'; // <-- 3. ¡Activar la redirección!
}            else {
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