const jwt = require('jsonwebtoken')
const User = require ('../models/userModel')

const requireAuth = (requiredRole =null)=> {
   return async (req, res, next) => {

 // verify authentication
 const {authorization}=req.headers

 if (!authorization) {
    return res.status(401).json({error: 'Authorization token required'})
 }

 const token = authorization.split(' ')[1]

 try {
    const {_id, role} = jwt.verify(token,process.env.SECRET)
    req.user = await User.findOne({_id}).select('_id role')

     // Check if the role is valid for the route
     if (requiredRole && role !== requiredRole) {
      return res.status(403).json({ error: 'You do not have the required permissions' });
    }

    req.user.role = role;
    next()




 } catch(error){
    console.log(error)
    res.status(401).json({error:'Request is not authorized'})


 }
   }
}
module.exports = requireAuth