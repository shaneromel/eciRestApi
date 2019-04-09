var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var jwt=require("jsonwebtoken");
var md5=require("md5");
var fs=require("fs");

router.post("/change", (req, res)=>{
    const data=req.body;
    const decoded=jwt.decode(req.headers.token);
    const privateKey=fs.readFileSync("./keys/private.key", 'utf8');

    db.query("SELECT password FROM admins WHERE email = ?", [decoded.email], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(results.length>0){
            if(results[0].password===md5(data.current)){
                const token=jwt.sign({email:decoded.email, password:data.new}, privateKey);

                db.query("UPDATE admins SET password = ? WHERE email = ?", [md5(data.new), decoded.email], (err, results, fields)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    res.send({code:"success", token:token});

                })

            }else{
                res.send({code:"error", message:"Current password is incorrect"})
            }
        }

    })

})

module.exports=router;