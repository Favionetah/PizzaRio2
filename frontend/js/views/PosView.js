export default {
    template: `
    <div class="pos-layout">
        
        <header class="pos-header">
            <div class="brand">
                <strong>🍕 TOMA DE PEDIDO</strong>
            </div>
            <div class="user-info">
                👤 CAJERO: {{ user.nombre }} | 
                <button @click="$emit('navigate', 'home-view')" style="background:none; border:1px solid white; color:white; cursor:pointer;">Salir</button>
            </div>
        </header>

        <div class="pos-main">
            
            <div class="section-products">
                <div class="category-tabs">
                    <button 
                        v-for="cat in categorias" 
                        :class="['tab-btn', { active: filtro === cat }]"
                        @click="filtro = cat"
                    >
                        {{ cat }}
                    </button>
                </div>

                <input type="text" v-model="busqueda" placeholder="🔍 BUSQUEDA" style="padding: 10px; margin-bottom: 10px; width: 100%;">

                <div class="products-grid-pos">
                    <div 
                        v-for="prod in productosFiltrados" 
                        :key="prod.id" 
                        class="card-pos"
                        @click="agregarAlCarrito(prod)"
                    >
                        <img v-if="prod.imagen" :src="'http://localhost:3000/uploads/' + prod.imagen">
                        <div v-else style="height:100px; background:#eee;"></div>
                        
                        <h4>{{ prod.nombre }}</h4>
                        <span>{{ prod.precio }} BS.</span>
                    </div>
                </div>
            </div>

            <div class="section-cart">
                <h2 style="color: var(--pos-red); margin-top:0;">RESUMEN PEDIDO</h2>
                
                <div class="client-info-box">
                    <div>
                        <label>CLIENTE:</label>
                        <input v-model="nombreCliente" placeholder="Nombre Cliente" style="border:none; background:transparent; font-weight:bold; width: 120px;">
                    </div>
                    <button style="background: var(--pos-red); color:white; border:none; padding:5px;">DATOS CLIENTE</button>
                </div>

                <div class="cart-list">
                    <div v-for="(item, index) in carrito" :key="index" class="cart-row">
                        <div>
                            <strong>{{ item.cantidad }}X</strong> {{ item.nombre }}
                            <div style="font-size:0.8em; color:#666;">{{ item.descripcion }}</div>
                        </div>
                        <div style="text-align:right;">
                            <div>{{ item.precio * item.cantidad }} BS.</div>
                            <button @click="eliminarDelCarrito(index)" style="color:red; border:none; background:none; cursor:pointer;">x</button>
                        </div>
                    </div>
                </div>

                <div class="totals-area">
                    <div style="display:flex; justify-content:space-between;">
                        <span>SUBTOTAL:</span> <span>{{ totalCarrito }} BS.</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <span style="font-size:1.5rem; font-weight:bold;">TOTAL:</span>
                        <span class="total-big">{{ totalCarrito }} BS.</span>
                    </div>

                    <button class="btn-confirm" @click="confirmarPedido" :disabled="carrito.length === 0">
                        CONFIRMAR PEDIDO
                    </button>
                    <button @click="carrito = []" style="width:100%; padding:10px; margin-top:5px; background:white; border:1px solid #ccc; cursor:pointer;">
                        CANCELAR
                    </button>
                </div>
            </div>
        </div>

        <div class="pos-footer-queue">
            <div>
                <h4 style="color: var(--pos-red); margin:0; display:inline-block; margin-right:10px;">PEDIDOS CONFIRMADOS</h4>
                <span class="queue-mini-list">
                    <span v-for="p in pedidosPendientes.slice(0, 3)" :key="p.idPedido" style="margin-right:15px;">
                        #{{ p.idPedido }} {{ p.nombreCliente }} ({{ p.estadoPedido }})
                    </span>
                </span>
            </div>
            <button class="btn-ver-mas" @click="mostrarModal = true">VER MÁS</button>
        </div>

        <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>PEDIDOS CONFIRMADOS</h2>
                    <button @click="mostrarModal = false" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:red;">X</button>
                </div>
                
                <div style="overflow-y:auto;">
                    <table class="queue-table">
                        <thead>
                            <tr>
                                <th>NRO</th>
                                <th>CLIENTE</th>
                                <th>ESTADO</th>
                                <th>TOTAL</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in pedidosPendientes" :key="p.idPedido">
                                <td>#{{ p.idPedido }}</td>
                                <td>{{ p.nombreCliente }}</td>
                                <td :style="{ color: getColorEstado(p.estadoPedido) }">
                                    <strong>{{ p.estadoPedido }}</strong>
                                </td>
                                <td>{{ p.totalPedido }} BS.</td>
                                <td>
                                    <button @click="avanzarEstado(p)" style="cursor:pointer; background:none; border:none; font-size:1.2rem;" title="Avanzar">
                                        ✅
                                    </button>
                                    <button style="cursor:pointer; background:none; border:none; font-size:1.2rem;" title="Ver Detalle">
                                        🔍
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>
    `,
    props: ['user'],
    data() {
        return {
            // DATOS DEL MENÚ (Vender)
            productos: [],
            carrito: [],
            categorias: ['Pizzas', 'Bebidas', 'Combos', 'Otros'],
            filtro: 'Pizzas',
            busqueda: '',
            nombreCliente: 'Juan Perez', // Default para probar
            
            // DATOS DE LA COLA (Gestionar)
            pedidosPendientes: [],
            mostrarModal: false,
            timer: null
        }
    },
    computed: {
        productosFiltrados() {
            let lista = this.productos;
            // Filtro por categoría (mapeo simple porque en BD guardamos 'pizza' o 'Bebida')
            if (this.filtro === 'Pizzas') lista = this.productos.filter(p => p.categoria === 'Pizzas' || p.categoria === 'pizza');
            else if (this.filtro === 'Bebidas') lista = this.productos.filter(p => p.categoria === 'Bebida');
            // ... otros filtros
            
            // Filtro por búsqueda
            if (this.busqueda) {
                lista = lista.filter(p => p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()));
            }
            return lista;
        },
        totalCarrito() {
            return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        }
    },
    mounted() {
        this.cargarProductos();
        this.cargarPedidosPendientes();
        // Polling automático cada 5 seg para ver nuevos pedidos
        this.timer = setInterval(this.cargarPedidosPendientes, 500);
    },
    unmounted() {
        clearInterval(this.timer);
    },
    methods: {
        // --- LÓGICA DE VENTA ---
        async cargarProductos() {
            try {
                const res = await fetch('http://localhost:3000/api/products');
                this.productos = await res.json();
            } catch (e) { console.error(e); }
        },
        agregarAlCarrito(prod) {
            const existente = this.carrito.find(i => i.id === prod.id);
            if (existente) {
                existente.cantidad++;
            } else {
                this.carrito.push({ ...prod, cantidad: 1 });
            }
        },
        eliminarDelCarrito(index) {
            this.carrito.splice(index, 1);
        },
        async confirmarPedido() {
            if (!confirm(`¿Confirmar venta por ${this.totalCarrito} BS?`)) return;

            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        total: this.totalCarrito,
                        carrito: this.carrito,
                        // Aquí podrías enviar el nombreCliente si modificas el backend para recibirlo
                        // Por ahora usaremos el ID del usuario logueado
                    })
                });

                if (res.ok) {
                    alert("✅ PEDIDO CONFIRMADO");
                    this.carrito = []; // Limpiar carrito
                    this.nombreCliente = '';
                    this.cargarPedidosPendientes(); // Actualizar la lista de abajo inmediatamente
                } else {
                    alert("Error al guardar pedido");
                }
            } catch (e) {
                alert("Error de conexión");
            }
        },

        // --- LÓGICA DE GESTIÓN (COLA) ---
        async cargarPedidosPendientes() {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3000/api/pos/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    this.pedidosPendientes = await res.json();
                }
            } catch (e) { console.error(e); }
        },
        async avanzarEstado(pedido) {
            let nuevoEstado = '';
            if (pedido.estadoPedido === 'Pendiente') nuevoEstado = 'En preparación';
            else if (pedido.estadoPedido === 'En preparación') nuevoEstado = 'Entregado';
            else return;

            try {
                const token = localStorage.getItem('token');
                await fetch(`http://localhost:3000/api/pos/orders/${pedido.idPedido}/status`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                });
                this.cargarPedidosPendientes();
            } catch (e) { alert("Error"); }
        },
        getColorEstado(estado) {
            if (estado === 'Pendiente') return 'orange';
            if (estado === 'En preparación') return 'blue';
            return 'green';
        }
    }
}