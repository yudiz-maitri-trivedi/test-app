const User = require('../models/user');

async function login(req, res) {
    const oUser  =  await User.create({
        username: req.body.username
    })
    res.status(200).json('login success')
}

module.exports = { login }