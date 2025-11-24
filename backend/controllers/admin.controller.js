const AdminModel = require('../models/admin.model');

const AdminController = {};

AdminController.getData = async (req, res) => {
    try {
        const empleados = await AdminModel.getEmployees();
        const horariosBase = await AdminModel.getBaseSchedules();
        res.json({ empleados, horariosBase });
    } catch (error) {
        res.status(500).json({ message: "Error al cargar datos" });
    }
};

AdminController.createBaseSchedule = async (req, res) => {
    try {
        const { nombre, inicio, fin } = req.body;
        await AdminModel.createBaseSchedule(nombre, inicio, fin);
        res.json({ message: "Nuevo turno creado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al crear turno" });
    }
};

AdminController.getEmployeeSchedule = async (req, res) => { /* Igual que antes */
    try {
        const { ci } = req.params;
        const horarios = await AdminModel.getEmployeeSchedule(ci);
        res.json(horarios);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener horarios" });
    }
};

AdminController.assignSchedule = async (req, res) => {
    try {
        await AdminModel.assignSchedule(req.body);
        res.json({ message: "Horarios asignados correctamente" });
    } catch (error) {
        // Si es nuestro error de validación, enviamos 400
        if (error.message.includes('Tope alcanzado')) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: "Error al asignar horario" });
    }
};

AdminController.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params; // idHorarioEmpleado
        const { idNuevoHorario, nuevoDia } = req.body;
        await AdminModel.updateEmployeeSchedule(id, idNuevoHorario, nuevoDia);
        res.json({ message: "Horario actualizado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar" });
    }
};

AdminController.deleteSchedule = async (req, res) => { /* Igual que antes */
    try {
        const { id } = req.params;
        await AdminModel.deleteEmployeeSchedule(id);
        res.json({ message: "Horario eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
    }
};

module.exports = AdminController;