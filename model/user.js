const mongoose = require('mongoose')

const Userschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    usertype: String,
    Projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project'
    }]
})

const User = mongoose.model('User', Userschema);

module.exports = User;