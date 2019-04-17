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
});

router.post("/", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO designations (title) VALUES (?)", [data.title], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

router.delete("/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM designations WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;