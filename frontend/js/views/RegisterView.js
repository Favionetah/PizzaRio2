// Archivo: frontend/js/views/RegisterView.js

export default {
    template: `
        <div class="login-container">
            <div class="login-form-wrapper" style="max-width: 800px;">
                <h2 class="login-title">CREAR CUENTA</h2>
        
                <form @submit.prevent="handleRegister" class="login-form">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="ci">Cédula de Identidad (CI)</label>
                            <input type="text" id="ci" v-model="ci" required placeholder="Ej: 1234567">
                        </div>
                        <div class="form-group">
                            <label for="telefono">Teléfono</label>
                            <input type="tel" id="telefono" v-model="telefono" required placeholder="Ej: 77712345">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="nombre1">Primer Nombre</label>
                            <input type="text" id="nombre1" v-model="nombre1" required>
                        </div>
                        <div class="form-group">
                            <label for="nombre2">Segundo Nombre (Opcional)</label>
                            <input type="text" id="nombre2" v-model="nombre2">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="apellido1">Primer Apellido</label>
                            <input type="text" id="apellido1" v-model="apellido1" required>
                        </div>
                        <div class="form-group">
                            <label for="apellido2">Segundo Apellido (Opcional)</label>
                            <input type="text" id="apellido2" v-model="apellido2">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="direccion">Dirección</label>
                        <input type="text" id="direccion" v-model="direccion" required placeholder="Ej: Av. Principal #123">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Correo Electrónico</label>
                            <input type="email" id="email" v-model="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" v-model="password" required>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn-login">REGISTRARSE</button>
                </form>
                
                <p class="login-message" :style="{ color: messageColor }">{{ message }}</p>
                
                <button @click="$emit('navigate', 'login-view')" class="btn-back">
                    Ya tengo una cuenta (Iniciar Sesión)
                </button>

                <p class="login-footer">
                    © 2025 Pizza Rio - Todos los derechos reservados
                </p>
            </div>
        </div>
    `,
    data() {
        return {
            ci: '',
            nombre1: '',
            nombre2: '',
            apellido1: '',
            apellido2: '',
            telefono: '',
            direccion: '',
            email: '',
            password: '',
            message: '',
            messageColor: 'var(--rojo-tomate)'
        }
    },
    methods: {
        async handleRegister() {
            this.message = 'Procesando registro...';
            this.messageColor = 'orange';

            // Validaciones básicas extra
            if (this.password.length < 4) {
                this.message = 'La contraseña debe tener al menos 4 caracteres.';
                this.messageColor = 'var(--rojo-tomate)';
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ci: this.ci,
                        nombre1: this.nombre1,
                        nombre2: this.nombre2,
                        apellido1: this.apellido1,
                        apellido2: this.apellido2,
                        telefono: this.telefono,
                        direccion: this.direccion,
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