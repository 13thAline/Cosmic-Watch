const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next)=>{

    const authHeader = req.headers["authorization"];
    console.log(authHeader);

    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({
            success: false,
            message: "access denied"
        })
    }else{
        try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedToken);

        req.userinfo = decodedToken;
        next();
        } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: "access denied"
        })
    }
    }   
} 

    
module.exports= {protect:authMiddleware};