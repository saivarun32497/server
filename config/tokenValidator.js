const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");


const ACCESS_TOKEN_SECERT = "ejkvbehjcdascdascacaqhwejvwcvgvccvgavhadbcdvchcbhsvailk";

const validateToken = asyncHandler((req,res,next)=>{
    let token;
    let authHeader  = req.headers.Authorization || req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];
        jwt.verify(token , ACCESS_TOKEN_SECERT,(err,decoded) =>{
            if(err){
                res.status(401);
                throw new Error("token not valid ");
                console.log(err);
            }
            else{
                req.user = decoded.user;
                next();
            }
        });
    }
    if(!token){
        res.status(401);
        throw new Error("token not found ");
    }
    
});
module.exports= validateToken;