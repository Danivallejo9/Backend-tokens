const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    nombre: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        requiered: true,
        unique: true,
    },
    estado: {
        type: String,
        requiered: true,
        enum: [
            'Activo',
            'Inactivo',
        ]
    },
    contrasenia: {
        type: String,
        require: true,
    },
    rol: {
        type: String,
        enum: [
            'Administrador',
            'Docente',
        ]
    },
    fechaCreacion: {
        type: Date,
        requiered: true,
    },
    fechaActualizacion:{
        type: Date,
        requiered: true,
    } 
});

module.exports = model('Usuario', UsuarioSchema);
