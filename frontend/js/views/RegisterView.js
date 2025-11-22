// Archivo: frontend/js/views/RegisterView.js

export default {
    template: `
        <div class="login-container">
            <div class="login-form-wrapper">
                <h2 class="login-title">CREAR CUENTA</h2>
        
                <form @submit.prevent="handleRegister" class="login-form">
                    
                    <div>
                        <label for="ci">Cédula de Identidad (Usuario)</label>
                        <input type="text" id="ci" v-model="ci" required>
                    </div>
                    
                    <div>
                        <label for="name">Nombre Completo</label>
                        <input type="text" id="name" v-model="name" required>
                    </div>
                    
                    <div>
                        <label for="phone">Teléfono</label>
                        <input type="tel" id="phone" v-model="phone" required>
                    </div>

                    <div>
                        <label for="email">Email</label>
                        <input type="email" id="email" v-model="email" required>
                    </div>
                    
                    <div>
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" v-model="password" required>
                    </div>
                    
                    <button type="submit" class="btn-login">REGISTRARSE</button>
                </form>
                
                <p class="login-message" :style="{ color: messageColor }">{{ message }}</p>
                
                <button @click="$emit('navigate', 'login-view')" class="btn-back">
                    Ya tengo una cuenta (Iniciar Sesión)
                </button>

                <p class="login-footer">
                    © 2024 Pizza Rio - Todos los derechos reservados
                </p>
            </div>
        </div>
    `,
    data() {
        return {
            ci: '',
            name: '',
            phone: '',
            email: '',
            password: '',
            message: '',
            messageColor: 'var(--rojo-tomate)'
        }
    },
    methods: {
        async handleRegister() {
            // ... (Tu lógica de registro existente que llama al backend) ...
            this.message = 'Registrando...';
            this.messageColor = 'orange';

            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ci: this.ci,
                        name: this.name,
                        phone: this.phone,
                        email: this.email,
                        password: this.password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    this.message = data.message || 'Error al registrar la cuenta.';
                    this.messageColor = 'var(--rojo-tomate)';
                } else {
                    this.messageColor = 'green';
                    this.message = '¡Registro exitoso! Redirigiendo al Login...';
                    
                    // Opcional: Redirigir al login después de un pequeño retraso
                    setTimeout(() => {
                        this.$emit('navigate', 'login-view');
                    }, 1500); 
                }
            } catch (error) {
                console.error('Error al registrar:', error);
                this.message = 'Error de conexión con el servidor.';
                this.messageColor = 'var(--rojo-tomate)';
            }
        }
    }
}