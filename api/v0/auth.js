var express=require("express");
var router=express.Router();
var fs=require("fs");
var jwt=require("jsonwebtoken");
var db=require("../../utils/db");
var md5 = require('md5');

router.post("/login", (req, res)=>{
    const payload=req.body;
    const privateKey=fs.readFileSync("./keys/private.key", 'utf8');
    const publicKey=fs.readFileSync("./keys/public.key", 'utf8');

    db.query("SELECT password FROM admins WHERE email = ?", [payload.email], (err, results, fields)=>{
        if(err){
            res.status(403).send({code:"forbiddened"});
            return;
        }

        if(results.length>0){
            if(results[0].password===md5(payload.password)){
                let token=jwt.sign(payload, privateKey);
                res.send({token:token}) 
            }else{
                res.status(403).send({code:"forbiddened"});
            }
        }else{
            res.status(403).send({code:"forbiddened"});
        }

    })

    
    // res.status(403).send({token:token})
});

router.delete("/logout", (req, res)=>{
    res.send({code:"success"});
})

module.exports=router;