var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.get("/", (req, res)=>{
    db.query("SELECT * FROM designations", [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
})

module.exports=router;