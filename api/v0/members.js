var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO members (uid, name, designation, image, email) VALUES (?,?,?,?,?)", [data.uid, data.name, data.designation, data.image, data.email], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.get("/", (req, res)=>{
    db.query("SELECT * FROM members", (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
})

module.exports=router;