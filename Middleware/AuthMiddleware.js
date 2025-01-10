const jwt = require('jsonwebtoken');

const AuthMiddleware = (req,res,next)=>{
    const token = req.header('x-auth-token');
    if(!token)
    {
       return res.status(401).json({message:'No token,authorization denied!'});
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        //add user from payload 
        req.user = decoded;
        next();
    }
    catch(e) {
    return res.status(400).json({message:"Token is not valid"})
    }
}
module.exports = AuthMiddleware;