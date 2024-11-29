const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'], 
    required: true
  },
  pid : {
    type: String, 
    unique: true, 
    sparse: true
  }
})

// static signup method
userSchema.statics.signup = async function(email, password, role, pid) {

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  //validation
  if (!email || !password || !role) {
    throw Error('All fields must be filled')
  }
  if (role=== 'docotr' && !pid) {
    throw Error('PID is required for doctors');
  }
  if (!email || !emailPattern.test(email)) {
    throw Error('Email is not valid');
  }
  if (email.includes(".com.com") || email.includes(".co.uk.co")) {
    throw Error('Invalid email domain');
  }
  if (!validator.isEmail(email)) {
    throw Error('Email is not valid')
  }
  if(!validator.isStrongPassword(password)){
    throw Error('Password is not strong enough')
  }
  if (role === 'doctor' && await this.findOne({ pid })) {
    throw Error('PID already in use');
  }
  if (!['admin', 'doctor', 'patient'].includes(role)) {
    throw Error('Invalid role');
  }

  const exists = await this.findOne({ email })

  if (exists) {
    throw Error('Email already in use')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({ email, password: hash, role, pid })
  return user
}


//static login method
userSchema.statics.login = async function(email,password){

  if(!email || !password)
  {
      throw Error('All fields must be filled')
  }

  const user = await this.findOne({ email })

  if (!user) {
    throw Error('Incorrect email')
  }

  const match = await bcrypt.compare(password,user.password)

  if(!match){
    throw Error('Incorrect password')
  }

  return user
}



module.exports = mongoose.model('User', userSchema)