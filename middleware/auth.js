var jwt=require("jsonwebtoken");
var fs=require("fs");
var db=require("../utils/db");
var md5=require("md5");


module.exports=(req, res, next)=>{
    const token=req.headers.token;
    const publicKey=fs.readFileSync("./keys/public.key");
    const requestType=req.headers["request-type"];

    if(req.headers.is_server){
        next();
        return;
    }

    if(req.url.split("/")[2]==="refresh-token"){
        next();
        return;
    }

    if(req.method==="GET"){
        next();
        return;
    }

    if(requestType==="Android"){
        
        if(req.headers.package===process.env.PACKAGE_NAME){
            next();
        }else{
            const congnitoToken=req.headers.token;
            const decoded=jwt.decode(congnitoToken);
            const currentTime=Math.round(Date.now()/1000);

            if(decoded){
                if(decoded.exp<currentTime){
                    res.status(403).send({code:"token-expired"});
                }else if(decoded.aud!=process.env.APP_CLIENT_ID){
                    res.status(403).send({code:"forbiddened"});
                }else if(decoded.iss!=`https://cognito-idp.ap-south-1.amazonaws.com/${process.env.CONGNITO_USER_POOL_ID}`){
                    res.status(403).send({code:"forbiddened"});
                }else if(decoded.token_use!="id"){
                    res.status(403).send({code:"forbiddened"});
                }else{
                    next();
                }
            }else{
                res.status(403).send({code:"invalid-token"});
            }
        }

        return;

    }

    if(req.url.split("/")[2]==="auth"){
        next();
    }else{
        if(token){
            
            if(requestType!="Android"){
                const decoded=jwt.decode(token);

                db.query("SELECT password FROM admins WHERE email = ?", [decoded.email], (err, results, fields)=>{
                    if(err){
                        res.status(403).send({code:"forbiddened"});
                        return;
                    }

                    if(results.length>0){
                        if(results[0].password === md5(decoded.password)){
                            next();
                        }else{
                            res.status(403).send({code:"forbiddened"});
                        }
                    }else{
                        res.status(403).send({code:"forbiddened"});
                    }

                })
            }

        }else{
            res.status(403).send({code:"forbiddened", message:"No token provided"})
        }
    }

}