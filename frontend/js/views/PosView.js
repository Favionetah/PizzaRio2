export default {
    template: `
    <div class="pos-layout">
        
        <header class="pos-header">
            <div class="brand">
                <strong>🍕 TOMA DE PEDIDO</strong>
            </div>
            <div class="user-info">
                👤 CAJERO: {{ user.nombre }} | 
                <button @click="logout" style="background:none; border:1px solid white; color:white; cursor:pointer; border-radius:4px; padding:2px 8px;">Salir</button>
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

                <input type="text" v-model="busqueda" placeholder="🔍 BUSQUEDA" style="padding: 10px; margin-bottom: 10px; width: 100%; border:1px solid #ccc; border-radius:4px;">

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
                <h2 style="color: var(--pos-red); margin-top:0; border-bottom:2px solid var(--pos-red); padding-bottom:5px;">RESUMEN PEDIDO</h2>
                
                <div class="client-info-box">
                    <div>
                        <label>CLIENTE:</label>
                        <input v-model="nombreCliente" placeholder="Nombre Cliente" style="border:none; background:transparent; font-weight:bold; width: 140px;">
                    </div>
                    <button style="background: var(--pos-red); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">DATOS</button>
                </div>

                <div class="cart-list">
                    <div v-for="(item, index) in carrito" :key="index" class="cart-row">
                        <div>
                            <strong>{{ item.cantidad }}X</strong> {{ item.nombre }}
                            <div style="font-size:0.8em; color:#666;">{{ item.descripcion }}</div>
                        </div>
                        <div style="text-align:right;">
                            <div>{{ item.precio * item.cantidad }} BS.</div>
                            <button @click="eliminarDelCarrito(index)" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">✕</button>
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
                    <button @click="carrito = []" style="width:100%; padding:10px; margin-top:5px; background:white; border:1px solid #ccc; cursor:pointer; border-radius:4px;">
                        CANCELAR
                    </button>
                </div>
            </div>
        </div>

        <div class="pos-footer-queue">
            <div>
                <h4 style="color: var(--pos-red); margin:0; display:inline-block; margin-right:10px;">PEDIDOS CONFIRMADOS</h4>
                <span class="queue-mini-list">
                    <span v-for="p in pedidosPendientes.slice(0, 3)" :key="p.idPedido" style="margin-right:15px; font-size:0.85rem;">
                        #{{ p.idPedido }} {{ p.nombreCliente }} ({{ p.estadoPedido }})
                    </span>
                </span>
            </div>
            <div>
                <button class="btn-ver-mas" @click="mostrarModal = true">VER MÁS</button>
                <button class="btn-ver-mas" @click="abrirHistorial" style="margin-left: 10px;">HISTORIAL</button>
            </div>
        </div>

        <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
            <div class="modal-content" style="width: 90%; height: 90%;">
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
                                    <button 
                                        v-if="p.estadoPedido !== 'Entregado'" 
                                        @click="avanzarEstado(p)" 
                                        style="cursor:pointer; background:none; border:none; font-size:1.2rem; margin-right:10px;" 
                                        title="Avanzar Estado"
                                    >
                                        ✅
                                    </button>
                                    
                                    <button 
                                        @click="verDetalle(p)" 
                                        style="cursor:pointer; background:none; border:none; font-size:1.2rem;" 
                                        title="Ver Detalle"
                                    >
                                        🔍
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="mostrarHistorial" class="modal-overlay" @click.self="mostrarHistorial = false">
            <div class="modal-content" style="width: 95%; height: 95%; display:flex; flex-direction:column;">
                <div class="modal-header">
                    <h2>HISTORIAL DE PEDIDOS</h2>
                    <button @click="mostrarHistorial = false" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:red;">X</button>
                </div>

                <div class="filters-bar" style="display:flex; gap:10px; padding:10px; background:#eee; border-radius:4px; margin-bottom:10px;">
                    <input type="date" v-model="filtros.fecha" style="padding:5px;">
                    <input type="text" v-model="filtros.cliente" placeholder="Cliente..." style="padding:5px;">
                    <input type="text" v-model="filtros.pizza" placeholder="Pizza..." style="padding:5px;">
                    <button @click="cargarHistorial" style="background:var(--pos-red); color:white; border:none; padding:5px 15px; cursor:pointer; border-radius:4px;">FILTRAR</button>
                    <button @click="limpiarFiltros" style="background:#666; color:white; border:none; padding:5px 15px; cursor:pointer; border-radius:4px;">LIMPIAR</button>
                </div>

                <div class="table-container" style="flex:1; overflow-y:auto;">
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>FECHA</th>
                                <th>CLIENTE</th>
                                <th>TOTAL</th>
                                <th>ESTADO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in historialPedidos" :key="p.idPedido">
                                <td>#{{ p.idPedido }}</td>
                                <td>{{ formatearHora(p.fechaPedido) }}</td>
                                <td>{{ p.nombreCliente }}</td>
                                <td>{{ p.totalPedido }} BS.</td>
                                <td>
                                    <span class="status-badge" :style="{background: getColorEstado(p.estadoPedido)}">
                                        {{ p.estadoPedido }}
                                    </span>
                                </td>
                                <td>
                                    <button @click="verDetalle(p)" style="cursor:pointer; background:none; border:none; font-size:1.2rem;" title="Ver Detalle">
                                        🔍
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="selectedOrder" class="modal-overlay" style="z-index: 2000;" @click.self="selectedOrder = null">
            <div class="modal-receipt">
                
                <div class="modal-header-box">
                    <h3>DETALLE DE PEDIDO</h3>
                    <p>Orden Nro. #{{ selectedOrder.idPedido }}</p>
                    <p style="font-size: 0.8rem; margin-top: 5px; font-weight: normal;">
                        {{ formatearHora(selectedOrder.fechaPedido) }}
                    </p>
                </div>
                
                <ul class="receipt-list">
                    <li v-if="parseItems(selectedOrder.items).length === 0" style="text-align:center; color:#999;">
                        No hay detalles disponibles.
                    </li>

                    <li v-for="(item, index) in parseItems(selectedOrder.items)" :key="index" class="receipt-item">
                        <div class="item-desc">
                            <div>
                                <span class="item-qty">{{ item.cantidad }}x</span> 
                                <span class="item-name">{{ item.nombre }}</span>
                            </div>
                            <div class="item-unit-price">P.U: {{ item.precio }} BS.</div>
                        </div>
                        <div class="item-subtotal">
                            {{ (item.precio * item.cantidad).toFixed(2) }} BS.
                        </div>
                    </li>
                </ul>

                <div class="modal-footer-box">
                    <div class="receipt-total-row">
                        <span class="receipt-total-label">TOTAL</span>
                        <span class="receipt-total-amount">{{ selectedOrder.totalPedido }} BS.</span>
                    </div>
                    <button class="btn-close-modal-brown" @click="selectedOrder = null">CERRAR</button>
                </div>

            </div>
        </div>

    </div>
    `,
    props: ['user'],
    data() {
        return {
            // VENTA
            productos: [],
            carrito: [],
            categorias: ['Pizzas', 'Bebidas', 'Combos', 'Otros'],
            filtro: 'Pizzas',
            busqueda: '',
            nombreCliente: '',

            // GESTIÓN
            pedidosPendientes: [],
            mostrarModal: false, // Modal de la tabla grande
            selectedOrder: null, // Modal del detalle pequeño (recibo)
            timer: null,

            // HISTORIAL
            mostrarHistorial: false,
            historialPedidos: [],
            filtros: {
                fecha: '',
                cliente: '',
                pizza: ''
            }
        }
    },
    computed: {
        totalCarrito() {
            return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        },
        productosFiltrados() {
            let lista = this.productos;
            if (this.filtro === 'Pizzas') lista = this.productos.filter(p => p.categoria === 'Pizzas' || p.categoria === 'pizza');
            else if (this.filtro === 'Bebidas') lista = this.productos.filter(p => p.categoria === 'Bebida');

            if (this.busqueda) {
                lista = lista.filter(p => p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()));
            }
            return lista;
        }
    },
    mounted() {
        this.cargarProductos();
        this.cargarPedidosPendientes();
        this.timer = setInterval(this.cargarPedidosPendientes, 5000);
    },
    unmounted() {
        clearInterval(this.timer);
    },
    methods: {
        // --- MÉTODOS DE VENTA ---
        async cargarProductos() {
            try {
                const res = await fetch('http://localhost:3000/api/products');
                this.productos = await res.json();
            } catch (e) { console.error(e); }
        },
        agregarAlCarrito(prod) {
            const existente = this.carrito.find(i => i.id === prod.id);
            if (existente) existente.cantidad++;
            else this.carrito.push({ ...prod, cantidad: 1 });
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
                        nombreClienteManual: this.nombreCliente
                    })
                });

                if (res.ok) {
                    alert("✅ PEDIDO CONFIRMADO");
                    this.carrito = [];
                    this.nombreCliente = '';
                    this.cargarPedidosPendientes();
                } else {
                    alert("Error al guardar pedido");
                }
            } catch (e) { alert("Error de conexión"); }
        },

        // --- MÉTODOS DE GESTIÓN ---
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
        logout() {
            this.$emit('navigate', 'home-view');
            localStorage.removeItem('token');
            location.reload();
        },

        // --- NUEVOS MÉTODOS PARA EL MODAL DETALLE ---
        verDetalle(order) {
            this.selectedOrder = order;
        },

        // --- MÉTODOS HISTORIAL ---
        async cargarHistorial() {
            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams();
                if (this.filtros.fecha) params.append('fecha', this.filtros.fecha);
                if (this.filtros.cliente) params.append('cliente', this.filtros.cliente);
                if (this.filtros.pizza) params.append('pizza', this.filtros.pizza);

                const res = await fetch(`http://localhost:3000/api/pos/all-orders?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    this.historialPedidos = await res.json();
                }
            } catch (e) { console.error(e); }
        },
        abrirHistorial() {
            this.mostrarHistorial = true;
            this.cargarHistorial();
        },
        limpiarFiltros() {
            this.filtros = { fecha: '', cliente: '', pizza: '' };
            this.cargarHistorial();
        },

        getColorEstado(estado) {
            if (estado === 'Pendiente') return '#f39c12'; // Naranja
            if (estado === 'En preparación') return '#2980b9'; // Azul
            return '#27ae60'; // Verde
        },
        formatearHora(fechaISO) {
            if (!fechaISO) return '';
            const fecha = new Date(fechaISO);
            // Formato: DD/MM/YYYY HH:MM
            return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        parseItems(itemsJson) {
            try {
                // Si MySQL devuelve un objeto JSON directo, úsalo. Si es string, paréalo.
                return typeof itemsJson === 'string' ? JSON.parse(itemsJson) : (itemsJson || []);
            } catch (e) { return []; }
        }
    }
}