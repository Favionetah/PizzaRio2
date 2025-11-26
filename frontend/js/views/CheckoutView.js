export default {
    template: `
    <div class="checkout-layout">
        <h2>Revisión de tu Pedido</h2>

        <div v-if="carrito.length === 0" class="cart-empty">
            <p>No tienes productos en el carrito 😢</p>
            <button @click="$emit('navigate', 'client-view')">Volver al menú</button>
        </div>

        <div v-else class="checkout-items">
            <div v-for="item in carrito" :key="item.id" class="cart-item">
                <div class="cart-item-info">
                    <h4>{{ item.nombre }}</h4>
                    <span>{{ item.cantidad }} x Bs {{ item.precio }} = Bs {{ item.cantidad * item.precio }}</span>
                </div>
                <div class="cart-controls">
                    <button @click="cambiarCantidad(item, -1)">-</button>
                    <span>{{ item.cantidad }}</span>
                    <button @click="cambiarCantidad(item, 1)">+</button>
                </div>
            </div>

            <div class="cart-footer">
                <div class="total-row">
                    <span>Total a pagar:</span>
                    <span class="total-price">Bs {{ totalCarrito }}</span>
                </div>

                <div class="payment-selection">
                    <h3>Selecciona tu método de pago:</h3>
                    <button :class="{selected: metodoPago==='Tarjeta'}" @click="metodoPago='Tarjeta'">
                        💳 Tarjeta
                    </button>
                    <button :class="{selected: metodoPago==='QR'}" @click="generarQR()">
                        📱 QR
                    </button>
                </div>

                <div v-if="metodoPago==='QR'" class="qr-display">
                    <h4>Escanea este código para pagar:</h4>
                    <canvas ref="qrcodeCanvas"></canvas>
                    <p>Pago de Bs {{ totalCarrito }} por:</p>
                    <ul>
                        <li v-for="item in carrito" :key="item.id">{{ item.cantidad }} x {{ item.nombre }}</li>
                    </ul>
                </div>

                <div v-if="metodoPago==='Tarjeta'" class="card-form">
                    <h4>Ingresa los datos de tu tarjeta:</h4>
                    <input type="text" v-model="tarjeta.numero" placeholder="Número de tarjeta">
                    <input type="text" v-model="tarjeta.nombre" placeholder="Nombre en la tarjeta">
                    <input type="text" v-model="tarjeta.expiracion" placeholder="MM/AA">
                    <input type="text" v-model="tarjeta.cvv" placeholder="CVV">
                </div>

                <button class="btn-checkout" :disabled="!metodoPago || carrito.length===0" @click="confirmarPedido">
                    PAGAR Y CONFIRMAR ✅
                </button>
                <button class="btn-cancel" @click="$emit('navigate', 'client-view')">Cancelar</button>
            </div>
        </div>
    </div>
    `,
    props: ['user', 'carrito'],
    data() {
        return {
            metodoPago: null,
            tarjeta: { numero: '', nombre: '', expiracion: '', cvv: '' }
        }
    },
    computed: {
        totalCarrito() {
            return this.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
        }
    },
    methods: {
        cambiarCantidad(item, valor) {
            item.cantidad += valor;
            if (item.cantidad <= 0) {
                const index = this.carrito.findIndex(i => i.id === item.id);
                if (index !== -1) this.carrito.splice(index, 1);
            }
        },
        generarQR() {
            this.metodoPago = 'QR';
            this.$nextTick(() => {
                const canvas = this.$refs.qrcodeCanvas;
                if (!canvas) return;

                const textoQR = `Pago de Bs ${this.totalCarrito} por: ${this.carrito.map(i => i.cantidad + 'x ' + i.nombre).join(', ')}`;

                // Usando la nueva librería QRCode
                QRCode.toCanvas(canvas, textoQR, { width: 200 }, function (error) {
                    if (error) console.error(error);
                });
            });
        },
        async confirmarPedido() {
            if (!this.user) { alert("Debes iniciar sesión."); this.$emit('navigate', 'login-view'); return; }
            if (!this.metodoPago) { alert("Selecciona un método de pago."); return; }
            if (this.carrito.length === 0) { alert("Carrito vacío."); return; }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ total: this.totalCarrito, carrito: this.carrito, metodoPago: this.metodoPago })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`✅ Pedido confirmado! Número de pedido: #${data.idPedido}`);
                    this.carrito.splice(0, this.carrito.length);
                    this.$emit('navigate', 'client-view');
                } else {
                    alert("❌ Error al procesar el pedido: " + data.message);
                }
            } catch (error) { console.error(error); alert("Error de conexión."); }
        }
    }
}
