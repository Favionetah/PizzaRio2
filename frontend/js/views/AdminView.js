export default {
    template: `
        <div class="admin-layout">
            
            <!-- SIDEBAR: LISTA EMPLEADOS -->
            <aside class="admin-sidebar">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 style="color:var(--brand-dark)">ADMINISTRACIÓN</h2>
                    <button @click="$emit('navigate', 'home-view')" class="btn-secondary">Salir</button>
                </div>
                
                <div v-for="emp in empleados" :key="emp.CIEmpleado" 
                     class="emp-card" 
                     :class="{ active: seleccionado && seleccionado.CIEmpleado === emp.CIEmpleado }"
                     @click="verHorarios(emp)">
                    <div class="emp-name">{{ emp.nombre1 }} {{ emp.apellido1 }}</div>
                    <div class="emp-detail">📍 {{ emp.nombreSucursal }} - {{ emp.nombreCiudad }}</div>
                    <div class="emp-detail">🆔 {{ emp.CIEmpleado }}</div>
                </div>
            </aside>

            <!-- MAIN: GESTIÓN -->
            <main class="admin-content">
                
                <!-- PANTALLA DE BIENVENIDA -->
                <div v-if="!seleccionado" style="text-align:center; color:#999; margin-top:100px;">
                    <h1>🛠️ Gestión de Horarios</h1>
                    <p>Selecciona un empleado de la izquierda para comenzar.</p>
                    <br>
                    <button class="btn-brand" @click="mostrarModalTurno = true">➕ CREAR NUEVO TIPO DE TURNO</button>
                </div>

                <!-- PANTALLA DE EMPLEADO -->
                <div v-else class="panel-container">
                    <div class="panel-header">
                        <h2 style="margin:0; color:var(--brand-dark)">
                            📅 Horarios de: <span style="color:var(--brand-red)">{{ seleccionado.nombre1 }} {{ seleccionado.apellido1 }}</span>
                        </h2>
                        <small>Sucursal: {{ seleccionado.nombreSucursal }}</small>
                    </div>

                    <div style="margin-top:20px; display:flex; gap:10px;">
                        <button class="btn-brand" @click="modo = 'crear'">➕ Asignar Horarios</button>
                        <button class="btn-secondary" @click="mostrarModalTurno = true">⚙️ Crear Nuevo Turno Base</button>
                    </div>

                    <!-- MODO CREAR ASIGNACIÓN -->
                    <div v-if="modo === 'crear'" style="background:#f9f9f9; padding:15px; margin-top:20px; border:1px solid #ddd;">
                        <h3>Nueva Asignación</h3>
                        
                        <label><strong>1. Elige Turno:</strong></label>
                        <select v-model="form.idHorario" class="form-control" style="margin-bottom:10px;">
                            <option v-for="t in horariosBase" :key="t.idHorario" :value="t.idHorario">
                                {{ t.nombreHorario }} ({{ t.horaInicio }} - {{ t.horaFin }})
                            </option>
                        </select>

                        <label><strong>2. Elige Días:</strong></label>
                        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:15px;">
                            <label v-for="dia in diasSemana" :key="dia" style="background:white; padding:5px 10px; border:1px solid #ccc; border-radius:4px;">
                                <input type="checkbox" :value="dia" v-model="form.diasSeleccionados"> {{ dia }}
                            </label>
                        </div>

                        <button class="btn-brand" @click="guardarAsignacion">Guardar</button>
                        <button class="btn-secondary" @click="modo = 'ver'">Cancelar</button>
                    </div>

                    <!-- TABLA DE HORARIOS -->
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>Día</th>
                                <th>Turno</th>
                                <th>Horario</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="h in horariosEmpleado" :key="h.idHorarioEmpleado">
                                <td><strong>{{ h.diaSemana }}</strong></td>
                                <td>{{ h.nombreHorario }}</td>
                                <td>{{ h.horaInicio }} - {{ h.horaFin }}</td>
                                <td>
                                    <button @click="prepararEdicion(h)" title="Editar" style="border:none; background:none; cursor:pointer; font-size:1.2rem;">✏️</button>
                                    <button @click="eliminarHorario(h.idHorarioEmpleado)" title="Eliminar" style="border:none; background:none; cursor:pointer; font-size:1.2rem;">🗑️</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>

            <!-- MODAL: CREAR TIPO DE TURNO (Base) -->
            <div v-if="mostrarModalTurno" class="modal-overlay">
                <div class="modal-box">
                    <h3>Nuevo Tipo de Turno</h3>
                    <label>Nombre (ej: Madrugada):</label>
                    <input type="text" v-model="nuevoTurno.nombre" class="form-control" placeholder="Nombre descriptivo">
                    
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <div style="flex:1">
                            <label>Inicio:</label>
                            <!-- INPUT TYPE TIME: INTUITIVO -->
                            <input type="time" v-model="nuevoTurno.inicio" class="form-control">
                        </div>
                        <div style="flex:1">
                            <label>Fin:</label>
                            <input type="time" v-model="nuevoTurno.fin" class="form-control">
                        </div>
                    </div>

                    <div style="margin-top:20px; text-align:right;">
                        <button class="btn-brand" @click="crearTurnoBase">Crear</button>
                        <button class="btn-secondary" @click="mostrarModalTurno = false">Cancelar</button>
                    </div>
                </div>
            </div>

            <!-- MODAL: EDITAR ASIGNACIÓN -->
            <div v-if="horarioAEditar" class="modal-overlay">
                <div class="modal-box">
                    <h3>Editar Asignación</h3>
                    <p>Cambiando horario de <strong>{{ horarioAEditar.diaSemana }}</strong></p>
                    
                    <label>Cambiar Día:</label>
                    <select v-model="horarioAEditar.diaSemana" class="form-control">
                        <option v-for="d in diasSemana" :key="d" :value="d">{{ d }}</option>
                    </select>

                    <label style="margin-top:10px; display:block;">Cambiar Turno:</label>
                    <select v-model="horarioAEditar.idHorario" class="form-control">
                        <option v-for="t in horariosBase" :key="t.idHorario" :value="t.idHorario">
                            {{ t.nombreHorario }} ({{ t.horaInicio }} - {{ t.horaFin }})
                        </option>
                    </select>

                    <div style="margin-top:20px; text-align:right;">
                        <button class="btn-brand" @click="guardarEdicion">Actualizar</button>
                        <button class="btn-secondary" @click="horarioAEditar = null">Cancelar</button>
                    </div>
                </div>
            </div>

        </div>
    `,
    props: ['user'],
    data() {
        return {
            empleados: [],
            horariosBase: [],
            horariosEmpleado: [],
            seleccionado: null,
            modo: 'ver',
            mostrarModalTurno: false,
            horarioAEditar: null,
            diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            
            // Formularios
            form: { idHorario: '', diasSeleccionados: [] },
            nuevoTurno: { nombre: '', inicio: '', fin: '' }
        }
    },
    mounted() {
        this.cargarDatosIniciales();
    },
    methods: {
        getToken() { return localStorage.getItem('token'); },
        
        async cargarDatosIniciales() {
            try {
                const res = await fetch('http://localhost:3000/api/admin/init-data', {
                    headers: { 'Authorization': `Bearer ${this.getToken()}` }
                });
                const data = await res.json();
                this.empleados = data.empleados;
                this.horariosBase = data.horariosBase;
            } catch (e) { console.error(e); }
        },

        async verHorarios(emp) {
            this.seleccionado = emp;
            this.modo = 'ver';
            const res = await fetch(`http://localhost:3000/api/admin/employee/${emp.CIEmpleado}/schedule`, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            this.horariosEmpleado = await res.json();
        },

        // --- CREAR TURNO BASE ---
        async crearTurnoBase() {
            if(!this.nuevoTurno.nombre || !this.nuevoTurno.inicio || !this.nuevoTurno.fin) return alert("Llena todo");
            try {
                const res = await fetch('http://localhost:3000/api/admin/base-schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
                    body: JSON.stringify(this.nuevoTurno)
                });
                if(res.ok) {
                    alert("Turno Creado");
                    this.mostrarModalTurno = false;
                    this.cargarDatosIniciales(); // Recargar listas
                    this.nuevoTurno = { nombre: '', inicio: '', fin: '' };
                }
            } catch(e) { alert("Error"); }
        },

        // --- ASIGNAR HORARIOS (Con validación de error 400) ---
        async guardarAsignacion() {
            try {
                const res = await fetch('http://localhost:3000/api/admin/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
                    body: JSON.stringify({
                        ciEmpleado: this.seleccionado.CIEmpleado,
                        idHorario: this.form.idHorario,
                        dias: this.form.diasSeleccionados
                    })
                });
                
                const data = await res.json();
                if(res.ok) {
                    alert("✅ Guardado correctamente");
                    this.verHorarios(this.seleccionado);
                    this.modo = 'ver';
                    this.form.diasSeleccionados = [];
                } else {
                    alert("❌ Error: " + data.message); // Muestra el error de "Tope alcanzado"
                }
            } catch(e) { alert("Error de red"); }
        },

        // --- EDITAR ---
        prepararEdicion(horario) {
            // Creamos una copia para no editar la tabla directamente hasta guardar
            this.horarioAEditar = { ...horario }; 
        },
        async guardarEdicion() {
            try {
                const res = await fetch(`http://localhost:3000/api/admin/schedule/${this.horarioAEditar.idHorarioEmpleado}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
                    body: JSON.stringify({
                        idNuevoHorario: this.horarioAEditar.idHorario,
                        nuevoDia: this.horarioAEditar.diaSemana
                    })
                });
                if(res.ok) {
                    alert("Actualizado");
                    this.horarioAEditar = null;
                    this.verHorarios(this.seleccionado);
                }
            } catch(e) { alert("Error"); }
        },

        async eliminarHorario(id) {
            if(!confirm("¿Eliminar?")) return;
            await fetch(`http://localhost:3000/api/admin/schedule/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            this.verHorarios(this.seleccionado);
        }
    }
}