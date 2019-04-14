var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.get("/",(req, res)=>{
    db.query("SELECT email FROM admins",[],(err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
        }
        res.send({code:"success", data:results});
    })
});

router.post("/",(req, res)=>{
    const data = req.body;
    const email = data.email;
    const password = data.password;
    db.query("INSERT INTO admins (email, password) VALUES ( ?, MD5(?) )", [email, password], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
        }
        res.send({code:"success"});
    })
})

module.exports = router;