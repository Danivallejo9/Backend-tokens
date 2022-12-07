const { Router } = require('express');
const router =  Router();
const Usuario = require('../models/Usuario');
const { validationResult, check } = require('express-validator');
const bycript = require('bcryptjs');
const { generarJWT} = require('../helpers/jwt');

router.post('/', [
    check('email', 'email.requerido').isEmail(),
    check('contrasenia', 'contrasenia.requerida').not().isEmpty()
], async function(req, res) {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ mensaje: errors.array() });
        }

        const usuario = await Usuario.findOne({ email: req.body.email });
        if(!usuario) {
            return res.status(400).json({ mensaje: 'Usuario no encontrado'});
        }

        const esIgual = bycript.compareSync(req.body.contrasenia, usuario.contrasenia);
        if (!esIgual) {
            return res.status(400).json({ mensaje: 'Contraseña inválida'});
        }

        //generar token
        const token = generarJWT(usuario);

        res.json({ _id: usuario._id, nombre: usuario.nombre,
            email: usuario.email, rol: usuario.rol, access_token: token });

    }catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'internal server error'});
    }
})

module.exports = router;