var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/post", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO feedbacks (message, device_id, timestamp) VALUES (?,?,?)", [data.message, data.device_id, Date.now()], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.get("/get", (req, res)=>{
    db.query("SELECT * FROM feedbacks", [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
});

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM feedbacks WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })

})

module.exports=router;