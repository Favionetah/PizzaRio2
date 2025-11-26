import HomeView from './views/HomeView.js';
import LoginView from './views/LoginView.js';
import RegisterView from './views/RegisterView.js';
import ClientView from './views/ClientView.js';
import CheckoutView from './views/CheckoutView.js';
import PosView from './views/PosView.js';
import AdminCashiersView from './views/AdminCashiersView.js';
import MenuView from './views/MenuView.js';
import MyOrdersView from './views/MyOrdersView.js';
import ShowcaseView from './views/ShowcaseView.js';
import MapView from './views/MapView.js';
import AdminView from './views/AdminView.js';

const { createApp } = Vue;

createApp({
    components: {
        'home-view': HomeView,
        'login-view': LoginView,
        'register-view': RegisterView,
        'client-view': ClientView,
        'checkout-view': CheckoutView,
        'pos-view': PosView,
        'admin-employees-view': AdminCashiersView,
        'menu-view': MenuView,
        'myorders-view': MyOrdersView,
        'showcase-view': ShowcaseView,
        'map-view': MapView,
        'admin-schedules-view': AdminView
    },
    data() {
        return {
            currentView: 'home-view',
            user: null,
            carritoCheckout: [],
            carritoGlobal: [],
            showUserMenu: false
        }
    },
    methods: {
        handleNavigation(viewName) { this.currentView = viewName; this.showUserMenu = false; },
        toggleUserMenu() { this.showUserMenu = !this.showUserMenu; },
        goToLogin() { this.currentView = 'login-view'; },
        goToCheckout(carrito) {
            this.carritoCheckout = carrito;
            this.carritoGlobal = carrito;
            this.currentView = 'checkout-view';
        },
        handleLoginSuccess(userData) {
            this.user = userData;
            if (this.user.role === 'Administrador') this.currentView = 'home-view';
            else if (this.user.role === 'Cajero') this.currentView = 'pos-view';
            else this.currentView = 'client-view';
        },
        logout() { this.user = null; this.showUserMenu = false; localStorage.removeItem('token'); this.currentView = 'home-view'; }
    }
}).mount('#app');
