export default {
    template: `
        <div class="client-layout">
            
            <div class="menu-column">
                <div class="header-menu">
                    <h2>Hola, {{ user.nombre }}</h2>
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
                        >
                        <div class="info-producto">
                            <h3>{{ prod.nombre }}</h3>
                            <p class="desc">{{ prod.descripcion }}</p>
                            <div class="precio-btn">
                                <span>Bs {{ prod.precio }}</span>
                                <button class="btn-add" @click="agregar(prod)">AGREGAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="cart-column">
                <div class="cart-header">
                    <h3>Tu Pedido</h3>
                    <span class="badge">{{ carrito.length }} items</span>
                </div>

                <div v-if="carrito.length === 0" class="cart-empty">
                    <p>Tu canasta está vacía 😢</p>
                </div>

                <div v-else class="cart-items">
                    <div v-for="item in carrito" :key="item.id" class="cart-item">
                        <div class="cart-item-info">
                            <h4>{{ item.nombre }}</h4>
                            <span>Bs {{ item.precio * item.cantidad }}</span>
                        </div>
                        <div class="cart-controls">
                            <button @click="cambiarCantidad(item, -1)">-</button>
                            <span>{{ item.cantidad }}</span>
                            <button @click="cambiarCantidad(item, 1)">+</button>
                        </div>
                    </div>
                </div>

                <div class="cart-footer">
                    <div class="total-row">
                        <span>Total:</span>
                        <span class="total-price">Bs {{ totalCarrito }}</span>
                    </div>
                    <button 
                        class="btn-checkout" 
                        :disabled="carrito.length === 0"
                        @click="alert('¡Pronto conectaremos esto a la base de datos!')"
                    >
                        CONFIRMAR PEDIDO ✅
                    </button>
                </div>
            </div>

        </div>
    `,
    props: ['user'], 
    data() {
        return {
            productos: [],
            loading: true,
            filtro: 'Todos',
            // 1. NUEVO: Aquí guardaremos lo que el usuario elija
            carrito: [] 
        }
    },
    computed: {
        productosFiltrados() {
            if (this.filtro === 'Todos') return this.productos;
            return this.productos.filter(p => p.categoria === this.filtro);
        },
        // 2. NUEVO: Calculadora automática
        totalCarrito() {
            // Recorre el carrito y suma (precio * cantidad)
            return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        }
    },

    // mounted se ejecuta apenas aparece este componente en pantalla
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
        // 3. NUEVO: Función inteligente para añadir
        agregar(prod) {
            // Buscamos si este producto YA existe en el carrito
            const itemExistente = this.carrito.find(item => item.id === prod.id);

            if (itemExistente) {
                // Si ya existe, solo aumentamos el contador
                itemExistente.cantidad++;
            } else {
                // Si es nuevo, lo metemos al array con cantidad 1
                // Usamos {...prod} para crear una COPIA del producto y no romper nada
                this.carrito.push({ ...prod, cantidad: 1 });
            }
        },

        // 4. NUEVO: Función para aumentar/disminuir desde el carrito
        cambiarCantidad(item, valor) {
            item.cantidad += valor;
            // Si la cantidad llega a 0, lo borramos del carrito
            if (item.cantidad <= 0) {
                this.carrito = this.carrito.filter(i => i.id !== item.id);
            }
        }
    },
}