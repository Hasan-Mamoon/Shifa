const User = require('../models/userModel')
const jwt = require ('jsonwebtoken')


const createToken = (_id, role) => {
 return jwt.sign({_id, role}, process.env.SECRET, {expiresIn: '3d'})
}
// login a user
const loginUser = async (req, res) => {

  const {email,password}= req.body
  try {
    const user = await User.login(email, password)

    //create a token
    const token = createToken(user._id, user.role)
    //token=header(algo)+payload(id)+secret
    res.status(200).json({email, role:user.role, token})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

// signup a user
const signupUser = async (req, res) => {
  const {email, password, role, pid} = req.body

  try {
    const user = await User.signup(email, password, role, pid)

    //create a token
    const token = createToken(user._id, user.role)
    //token=header(algo)+payload(id)+secret
    res.status(200).json({email,role:user.role,pid:user.pid, token})
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

module.exports = { signupUser, loginUser }