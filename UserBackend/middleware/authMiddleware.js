const jwt = require('jsonwebtoken');

 const authMiddleware = function (req, res, next)  {
   
    const token = req.headers['authorization'];
    if (!token)  
      return res.status(401).json({msg:"Authorization Denied"});
    
    try {   
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    }
    catch (e) {   
        return res.status(401).json({msg:"Invalid Token"});
    }
}

module.exports = authMiddleware;