const { Router } = require('express');
const Usuario = require('../models/Usuario');
const { validarUsuarios } = require('../helpers/validar-usuarios');
const { validationResult, check } = require('express-validator');
const bycript = require('bcryptjs');
const {validarJWT } = require('../middlewares/validar-jwt');
const { validarRolAdmin } = require('../middlewares/validar-rol-admin');

const router =  Router();

router.post('/',[
    check('nombre', 'invalid.nombre').not().isEmpty(),
    check('email', 'invalid.email').isEmail(),
    check('estado', 'invalid.estado').isIn(['Activo', 'Inactivo']),
    check('rol', 'invalid.rol').isIn(['Administrador', 'Docente']),
    check('contrasenia', 'invalid.contrasenia').not().isEmpty(),
    validarJWT,
    validarRolAdmin
] ,async function(req, res){
   
try{
   console.log(req.body); //nombre, email, rol, contraseña

    //validación campos requeridos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ mensaje: errors.array() });
    }
       
    const existeEmail = await Usuario.findOne( { email: req.body.email});
    if(existeEmail){
        return res.status(400).json({mensaje: 'Email ya existe'});
    }

    let usuario = new Usuario();
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    usuario.estado = req.body.estado;

    const salt = bycript.genSaltSync()
    const contrasenia = bycript.hashSync(req.body.contrasenia, salt);
    usuario.contrasenia = contrasenia;

    usuario.rol = req.body.rol;
    usuario.fechaCreacion = new Date();
    usuario.fechaActualizacion = new Date();

    usuario = await usuario.save();
    res.send(usuario);

}catch (error){
    console.log(error);
    res.status(500).json({ mensaje: 'Internal server error'})
}




});

router.get('/', [validarJWT], async function(req, res){
    try {
        const usuarios = await Usuario.find();
        res.send(usuarios);
    } catch(error){
        console.log(error);
        res.status(500).json({ mensaje: 'Internal server error'})
    }
});


router.put('/:usuarioId', [validarJWT], async function(req, res){
    try{

        const validaciones = validarUsuarios(req);
       
       if (validaciones.length > 0){
            return res.status(400).send(validaciones);
       }

        console.log('Objeto recibido', req.body, req.params);

        let usuario = await Usuario.findById(req.params.usuarioId);

        if(!usuario){
            return res.status(400).send('usuario no existe');
        }

        
        const existeUsuario = await Usuario
        .findOne( { email: req.body.email, _id: { $ne: usuario._id } });

        console.log('Existe usuario', existeUsuario);
        
        if(existeUsuario){
            return res.status(400).send('Email ya existe');
        }
    
            usuario.nombre = req.body.nombre;
            usuario.email = req.body.email;
            usuario.estado = req.body.estado;
            usuario.fechaActualizacion = new Date();
         
        usuario = await usuario.save();
    
        res.send(usuario);
    
    }catch (error){
        console.log(error);
        res.status(500).json({ mensaje: 'Internal server error'})
    }
});

router.get('/:usuarioId', [validarJWT], async function(req, res) {
    try {
        const usuario = await Usuario.findById(req.params.usuarioId);
        if (!usuario) {
            return res.status(404).send('Usuario no existe');
        }
        res.send(usuario);
    }catch (error) {
        console.log(error);
        res.status(500).send('Error al consultar Usuario');
    }
});

module.exports = router; 