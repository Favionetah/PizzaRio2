// frontend/js/views/HomeView.js

export default {
    template: `
        <div class="home-content-wrapper">
            <div class="home-hero-image-top">
                
            </div>

            <div class="home-text-block">
                <h2>¡EL SABOR DE RÍO<br>EN TU CASA!</h2>
                <p>Descarga nuestra app o pide directamente aquí.</p>
                
                <button @click="$emit('navigate', 'login-view')" class="btn-hero-order">
                    🍽 PIDE AQUÍ
                </button>

                <section class="additional-info">
                    <h3>Nuestros Ingredientes Frescos</h3>
                    <p>En Pizza Río solo usamos los mejores tomates, queso mozzarella importado y la masa más crujiente. ¡Una experiencia que tienes que probar!</p>
                    <p>📍 Encuéntranos en La Paz y Santa Cruz.</p>
                </section>
                
            </div>
        </div>
    `,
    methods: {
        // Redirección
        goToOrder() {
            this.$emit('navigate', 'login-view');
        }
    }
}