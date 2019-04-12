var express=require("express");
var router=express.Router();
var db=require("../../utils/db");


//message group_title
router.post("/", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO messages (group_title, message, timestamp) VALUES (?,?,?)", [data.group_title, data.message, Date.now()], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        res.send({code:"success"});

    })

});