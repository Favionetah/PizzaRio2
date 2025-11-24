export default {
    template: `
        <div class="login-container">
            <div class="login-form-wrapper">
                <div class="login-logo">
                    <img src="./images/pizzaoceanohdPENEg.png" alt="Pizza Rio" class="logoPizza">
                </div>
                
                <h2 class="login-title">INICIAR SESIÓN</h2>
        
                <form @submit.prevent="handleLogin" class="login-form">
                    <div>
                        <label for="email">Usuario</label>
                        <input type="email" id="email" v-model="email" required>
                    </div>
                    
                    <div>
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" v-model="password" required>
                    </div>
                    
                    <button type="submit" class="btn-login">ENTRAR</button>
                </form>
                
                <p class="login-message" :style="{ color: messageColor }">{{ message }}</p>
                
                <div class="register-link-wrapper">
                    <p>¿No eres cliente?</p><br>
                    <button @click="$emit('navigate', 'register-view')" class="btn-register-link">Regístrate aquí</button>
                </div>
                <button @click="$emit('navigate', 'home-view')" class="btn-back">Volver</button>
                
                <p class="login-footer">
                    © 2024 Pizza Rio - Todos los derechos reservados
                </p>
            </div>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            message: '',
            messageColor: 'var(--rojo-tomate)'
        }
    },
    methods: {
        async handleLogin() {
            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    this.message = data.message;
                    this.messageColor = 'var(--rojo-tomate)';
                } else {
                    this.message = 'Ingresando...';
                    this.messageColor = 'green';

                    localStorage.setItem('token', data.token);

                    this.$emit('login-success', {
                        email: this.email,
                        role: data.role,
                        nombre: data.nombre
                    });
                }
            } catch (error) {
                console.error('Error en el login: ', error);
                this.message = 'Error al conectar con el servidor';
                this.messageColor = 'var(--rojo-tomate)';
            }
        }
    }
}