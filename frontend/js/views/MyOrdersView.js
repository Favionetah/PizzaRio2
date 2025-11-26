export default {
    template: `
        <div class="my-orders-container">
            
            <div class="orders-header-row">
                <h2 class="orders-title">
                    {{ isStaff ? 'GESTIÓN DE PEDIDOS' : 'MIS PEDIDOS' }}
                </h2>
                
                <div style="display:flex; gap:10px;">
                    <button v-if="!isStaff" class="btn-pide-aqui" @click="$emit('navigate', 'client-view')">
                        Nuevo Pedido
                    </button>

                    <button 
                        v-if="isAdmin" 
                        class="btn-pide-aqui" 
                        style="background-color: var(--brand-dark); border:none;"
                        @click="abrirHistorial"
                    >
                        📜 HISTORIAL GLOBAL
                    </button>

                    <button v-if="isStaff" @click="$emit('navigate', 'home-view')" style="background:none; border:none; color:#c0392b; font-size:1.5rem; font-weight:bold; cursor:pointer;">X</button>
                </div>
            </div>

            <div v-if="loading" style="text-align:center; padding:40px; color:#888;">
                Cargando lista...
            </div>

            <div v-else class="table-responsive">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>NRO</th>
                            <th v-if="isStaff">CLIENTE</th> <th v-else>FECHA</th>
                            <th>ESTADO</th>
                            <th>TOTAL</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in orders" :key="order.idPedido">
                            <td class="col-id">#{{ order.idPedido }}</td>
                            
                            <td v-if="isStaff" style="font-weight:bold; color:#333;">
                                {{ order.nombreCliente || 'Cliente Casual' }}
                            </td>
                            <td v-else>
                                {{ formatDate(order.fechaPedido) }}
                            </td>
                            
                            <td>
                                <span :class="'status-text st-text-' + normalizeStatus(order.estadoPedido)">
                                    {{ order.estadoPedido }}
                                </span>
                            </td>
                            
                            <td class="col-total">{{ parseFloat(order.totalPedido).toFixed(2) }} BS.</td>
                            
                            <td>
                                <div class="actions-cell">
                                    <button v-if="isStaff && order.estadoPedido !== 'Entregado'" class="btn-icon-square btn-check" title="Avanzar Estado" @click="avanzarEstado(order)">✅</button>
                                    <button class="btn-icon-square btn-search" title="Ver Detalle" @click="verDetalle(order)">🔍</button>
                                    <button v-if="isStaff && order.estadoPedido === 'Pendiente'" class="btn-icon-square btn-cancel-x" title="Cancelar" @click="cancelarPedido(order)">✖</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="selectedOrder" class="modal-overlay" style="z-index: 2000;" @click.self="selectedOrder = null">
                <div class="modal-receipt">
                    <div class="modal-header-box">
                        <h3>DETALLE DE PEDIDO</h3>
                        <p>Orden Nro. #{{ selectedOrder.idPedido }}</p>
                        <p style="font-size: 0.8rem; margin-top: 5px; font-weight: normal;">
                            {{ formatDate(selectedOrder.fechaPedido) }}
                        </p>
                    </div>
                    <ul class="receipt-list">
                        <li v-if="parseItems(selectedOrder.items).length === 0" style="text-align:center; color:#999;">No hay detalles.</li>
                        <li v-for="(item, index) in parseItems(selectedOrder.items)" :key="index" class="receipt-item">
                            <div class="item-desc">
                                <div><span class="item-qty">{{ item.cantidad }}x</span> <span class="item-name">{{ item.nombre }}</span></div>
                                <div class="item-unit-price">P.U: {{ item.precio }} BS.</div>
                            </div>
                            <div class="item-subtotal">{{ (item.precio * item.cantidad).toFixed(2) }} BS.</div>
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

            <div v-if="mostrarHistorial" class="modal-overlay" style="z-index: 2000;" @click.self="mostrarHistorial = false">
                <div class="modal-content" style="width: 95%; height: 90%; background:white; padding:20px; border-radius:10px; display:flex; flex-direction:column;">
                    
                    <div class="modal-header" style="display:flex; justify-content:space-between; border-bottom:2px solid var(--rojo-tomate); padding-bottom:10px; margin-bottom:15px;">
                        <h2 style="color:var(--rojo-tomate); margin:0;">📜 HISTORIAL GLOBAL DE VENTAS</h2>
                        <button @click="mostrarHistorial = false" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:red;">X</button>
                    </div>

                    <div class="filters-bar" style="display:flex; gap:10px; padding:15px; background:#f4f4f4; border-radius:8px; margin-bottom:15px; flex-wrap:wrap;">
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; font-weight:bold;">Fecha:</label>
                            <input type="date" v-model="filtros.fecha" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; font-weight:bold;">Cliente:</label>
                            <input type="text" v-model="filtros.cliente" placeholder="Nombre..." style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.8rem; font-weight:bold;">Producto:</label>
                            <input type="text" v-model="filtros.pizza" placeholder="Pizza..." style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        </div>
                        <div style="display:flex; align-items:end; gap:5px;">
                            <button @click="cargarHistorial" style="background:var(--rojo-tomate); color:white; border:none; padding:10px 20px; cursor:pointer; border-radius:4px; font-weight:bold;">FILTRAR</button>
                            <button @click="limpiarFiltros" style="background:#666; color:white; border:none; padding:10px 20px; cursor:pointer; border-radius:4px;">LIMPIAR</button>
                        </div>
                    </div>

                    <div class="table-container" style="flex:1; overflow-y:auto; border:1px solid #eee;">
                        <table class="orders-table">
                            <thead>
                                <tr>
                                    <th>ID</th> <th>FECHA</th> <th>CLIENTE</th> <th>TOTAL</th> <th>ESTADO</th> <th>ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="historialPedidos.length === 0">
                                    <td colspan="6" style="text-align:center; padding:20px;">No se encontraron resultados.</td>
                                </tr>
                                <tr v-for="p in historialPedidos" :key="p.idPedido">
                                    <td class="col-id">#{{ p.idPedido }}</td>
                                    <td>{{ formatearHora(p.fechaPedido) }}</td>
                                    <td>{{ p.nombreCliente }}</td>
                                    <td class="col-total">{{ p.totalPedido }} BS.</td>
                                    <td>
                                        <span :class="'status-text st-text-' + normalizeStatus(p.estadoPedido)">{{ p.estadoPedido }}</span>
                                    </td>
                                    <td>
                                        <button class="btn-icon-square btn-search" title="Ver Detalle" @click="verDetalle(p)">🔍</button>
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
            orders: [],
            loading: true,
            selectedOrder: null,
            timer: null,

            // 3. VARIABLES NUEVAS PARA EL HISTORIAL
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
        // Solo el rol 'Administrador' verá el botón de historial
        isAdmin() {
            return this.user && this.user.role === 'Administrador';
        },
        isStaff() {
            return this.user && (this.user.role === 'Administrador' || this.user.role === 'Cajero');
        }
    },
    mounted() {
        this.fetchOrders();
        if (this.isStaff) {
            this.timer = setInterval(() => this.fetchOrders(true), 5000);
        }
    },
    unmounted() {
        if (this.timer) clearInterval(this.timer);
    },
    methods: {
        async fetchOrders(silent = false) {
            if (!silent) this.loading = true;
            try {
                const token = localStorage.getItem('token');
                let url = this.isStaff 
                    ? 'http://localhost:3000/api/pos/orders' 
                    : 'http://localhost:3000/api/orders/my-history';

                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    this.orders = await res.json();
                }
            } catch (error) { console.error(error); } 
            finally { if (!silent) this.loading = false; }
        },

        // --- LÓGICA ESTÁNDAR (Ya existente) ---
        async avanzarEstado(order) {
            let nuevoEstado = '';
            if (order.estadoPedido === 'Pendiente') nuevoEstado = 'En preparación';
            else if (order.estadoPedido === 'En preparación') nuevoEstado = 'Entregado';
            else return; 

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3000/api/pos/orders/${order.idPedido}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ estado: nuevoEstado })
                });
                if (res.ok) { order.estadoPedido = nuevoEstado; this.fetchOrders(true); }
            } catch (e) { alert("Error"); }
        },

        async cancelarPedido(order) {
            if(!confirm("¿Cancelar?")) return;
            try {
                const token = localStorage.getItem('token');
                await fetch(`http://localhost:3000/api/pos/orders/${order.idPedido}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ estado: 'Cancelado' })
                });
                this.fetchOrders(true); 
            } catch (e) { alert("Error"); }
        },

        verDetalle(order) {
            this.selectedOrder = order;
        },

        // --- 4. NUEVOS MÉTODOS PARA EL HISTORIAL (COPIADOS DE POSVIEW) ---
        async cargarHistorial() {
            try {
                const token = localStorage.getItem('token');
                
                // Construimos la URL con parámetros GET
                const params = new URLSearchParams();
                if (this.filtros.fecha) params.append('fecha', this.filtros.fecha);
                if (this.filtros.cliente) params.append('cliente', this.filtros.cliente);
                if (this.filtros.pizza) params.append('pizza', this.filtros.pizza);

                // Nota: Asegúrate de que tu backend tenga esta ruta habilitada
                const res = await fetch(`http://localhost:3000/api/pos/all-orders?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    this.historialPedidos = await res.json();
                }
            } catch (e) { console.error("Error historial", e); }
        },
        
        abrirHistorial() {
            this.mostrarHistorial = true;
            this.cargarHistorial(); // Carga inicial sin filtros
        },
        
        limpiarFiltros() {
            this.filtros = { fecha: '', cliente: '', pizza: '' };
            this.cargarHistorial();
        },

        // Helpers
        formatDate(dateString) { return this.formatearHora(dateString); }, // Alias
        
        formatearHora(fechaISO) {
            if (!fechaISO) return '';
            const fecha = new Date(fechaISO);
            return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        },
        normalizeStatus(status) {
            if (!status) return 'unknown';
            return status.toLowerCase().replace(/\s+/g, '-');
        },
        parseItems(itemsJson) {
            try {
                return typeof itemsJson === 'string' ? JSON.parse(itemsJson) : (itemsJson || []);
            } catch (e) { return []; }
        }
    }
}