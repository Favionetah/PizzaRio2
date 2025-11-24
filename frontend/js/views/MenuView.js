export default {
    template: `
        <div class="menu-view-container" style="padding: 20px; background-color: var(--bg-crema); min-height: 100vh;">
            
            <div class="menu-column" style="width: 100%; padding: 0;">
                <div class="header-menu">
                    <h2>Nuestro Menú</h2>
                    <div class="filtros">
                        <button :class="{ activo: filtro === 'Todos' }" @click="filtro = 'Todos'">Todos</button>
                        <button :class="{ activo: filtro === 'Pizzas' }" @click="filtro = 'Pizzas'">🍕 Pizzas</button>
                        <button :class="{ activo: filtro === 'Bebida' }" @click="filtro = 'Bebida'">🥤 Bebidas</button>
                    </div>
                </div>

                <div v-if="loading" class="loading">Cargando sabor...</div>

                <div v-else class="grid-productos">
                    <div v-for="prod in productosFiltrados" :key="prod.id" class="card-producto">
                        <img 
                            v-if="prod.imagen" 
                            :src="'http://localhost:3000/uploads/' + prod.imagen" 
                            class="foto-producto"
                            @click="openModal(prod)"
                            style="cursor:pointer"
                        >
                        <div class="info-producto">
                            <h3 @click="openModal(prod)" style="cursor:pointer">{{ prod.nombre }}</h3>
                            <p class="desc">{{ prod.descripcion }}</p>
                            <div class="precio-btn">
                                <span>Bs {{ prod.precio }}</span>
                                <button class="btn-add" @click="goToLogin">ORDENAR</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal de producto -->
                <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
                    <div class="modal-card">
                        <button class="modal-close" @click="closeModal">✕</button>
                        <div class="modal-body">
                            <img v-if="selectedProduct && selectedProduct.imagen" :src="'http://localhost:3000/uploads/' + selectedProduct.imagen" class="modal-image">
                            <div class="modal-info">
                                <h2>{{ selectedProduct.nombre }}</h2>
                                <p class="modal-desc">{{ selectedProduct.descripcion }}</p>
                                <p><strong>Categoría:</strong> {{ selectedProduct.categoria }}</p>
                                <p><strong>Precio:</strong> Bs {{ selectedProduct.precio }}</p>
                                <div class="modal-actions">
                                    <button class="btn-add" @click="goToLogin">Iniciar Sesión para Ordenar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            productos: [],
            loading: true,
            filtro: 'Todos',
            modalOpen: false,
            selectedProduct: null
        }
    },
    computed: {
        productosFiltrados() {
            if (this.filtro === 'Todos') return this.productos;
            return this.productos.filter(p => p.categoria === this.filtro);
        }
    },
    async mounted() {
        try {
            const res = await fetch('http://localhost:3000/api/products');
            const data = await res.json();
            this.productos = data;
            this.loading = false;
        } catch (error) {
            console.error('Error cargando menú:', error);
            this.loading = false;
        }
    },
    methods: {
        openModal(prod) {
            this.selectedProduct = prod;
            this.modalOpen = true;
        },
        closeModal() {
            this.modalOpen = false;
            this.selectedProduct = null;
        },
        goToLogin() {
            this.$emit('navigate', 'login-view');
        }
    }
}
