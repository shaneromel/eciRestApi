var jwt=require("jsonwebtoken");
var fs=require("fs");
var db=require("../utils/db");
var md5=require("md5");

module.exports=(req, res, next)=>{
    const token=req.headers.token;
    const publicKey=fs.readFileSync("./keys/public.key");
    const requestType=req.headers["request-type"];

    if(req.url.split("/")[2]==="refresh-token"){
        next();
        return;
    }

    if(req.method==="GET"){
        next();
        return;
    }

    if(requestType==="Android"){
        next();
        return;
    }

    if(req.url.split("/")[2]==="auth"){
        next();
    }else{
        // if(token){
        //     const decoded=jwt.decode(token);

        //     db.query("SELECT password FROM admins WHERE email = ?", [decoded.email], (err, results, fields)=>{
        //         if(err){
        //             res.status(403).send({code:"forbiddened"});
        //             return;
        //         }

        //         if(results.length>0){
        //             if(results[0].password === md5(decoded.password)){
        //                 next();
        //             }else{
        //                 res.status(403).send({code:"forbiddened"});
        //             }
        //         }else{
        //             res.status(403).send({code:"forbiddened"});
        //         }

        //     })

        // }else{
        //     res.status(403).send({code:"forbiddened", message:"No token provided"})
        // }
        next();
    }

}