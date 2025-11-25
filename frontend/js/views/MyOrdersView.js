export default {
    template: `
        <div class="my-orders-container">
            
            <div class="orders-header-row">
                <h2 class="orders-title">
                    {{ isStaff ? 'PEDIDOS CONFIRMADOS' : 'MIS PEDIDOS' }}
                </h2>
                <button v-if="!isStaff" class="btn-pide-aqui" @click="$emit('navigate', 'client-view')">
                    Nuevo Pedido
                </button>
                <button v-if="isStaff" @click="$emit('navigate', 'home-view')" style="background:none; border:none; color:#c0392b; font-size:1.5rem; font-weight:bold; cursor:pointer;">X</button>
            </div>

            <div v-if="loading" style="text-align:center; padding:40px; color:#888;">
                Cargando lista...
            </div>

            <div v-else class="table-responsive">
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>NRO</th>
                            <th v-if="isStaff">CLIENTE</th> 
                            <th v-else>FECHA</th>
                            <th>ESTADO</th>
                            <th>TOTAL</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in orders" :key="order.idPedido">
                            <td class="col-id">#{{ order.idPedido }}</td>
                            
                            <td v-if="isStaff" style="color:#333;">
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
                                    
                                    <button 
                                        v-if="isStaff && order.estadoPedido !== 'Entregado'" 
                                        class="btn-icon-square btn-check" 
                                        title="Avanzar Estado"
                                        @click="avanzarEstado(order)"
                                    >
                                        ✅
                                    </button>

                                    <button class="btn-icon-square btn-search" title="Ver Detalle" @click="verDetalle(order)">
                                        🔍
                                    </button>

                                    <button 
                                        v-if="isStaff && order.estadoPedido === 'Pendiente'" 
                                        class="btn-icon-square btn-cancel-x" 
                                        title="Cancelar" 
                                        @click="cancelarPedido(order)"
                                    >
                                        ✖
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="selectedOrder" class="modal-overlay" @click.self="selectedOrder = null">
                <div class="modal-receipt">
                    
                    <div class="modal-header-box">
                        <h3>DETALLE DE PEDIDO</h3>
                        <p>Orden Nro. #{{ selectedOrder.idPedido }}</p>
                        <p style="font-size: 0.8rem; margin-top: 5px; font-weight: normal;">
                            {{ formatDate(selectedOrder.fechaPedido) }}
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
                        <button class="btn-close-modal" @click="selectedOrder = null">CERRAR</button>
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
            timer: null
        }
    },
    computed: {
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
                // Si es Staff ve TODOS los pendientes/proceso, si es Cliente ve SU historial
                let url = this.isStaff 
                    ? 'http://localhost:3000/api/pos/orders' 
                    : 'http://localhost:3000/api/orders/my-history';

                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    this.orders = await res.json();
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (!silent) this.loading = false;
            }
        },

        async avanzarEstado(order) {
            let nuevoEstado = '';
            if (order.estadoPedido === 'Pendiente') nuevoEstado = 'En preparación';
            else if (order.estadoPedido === 'En preparación') nuevoEstado = 'Entregado';
            else return; 

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3000/api/pos/orders/${order.idPedido}/status`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                });

                if (res.ok) {
                    order.estadoPedido = nuevoEstado; // Actualización optimista
                    this.fetchOrders(true); // Asegurar sincronización
                }
            } catch (e) { alert("Error de conexión"); }
        },

        async cancelarPedido(order) {
            if(!confirm("¿Cancelar este pedido definitivamente?")) return;
            try {
                const token = localStorage.getItem('token');
                await fetch(`http://localhost:3000/api/pos/orders/${order.idPedido}/status`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ estado: 'Cancelado' })
                });
                this.fetchOrders(true); 
            } catch (e) { alert("Error"); }
        },

        verDetalle(order) {
            this.selectedOrder = order;
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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