var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/post", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO support_feedback (message, name, email,timestamp, phone) VALUES (?,?,?,?,?)", [data.message, data.name, data.email, Date.now(), data.phone], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.get("/get", (req, res)=>{
    db.query("SELECT * FROM support_feedback ORDER BY timestamp DESC", [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
});

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM support_feedback WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })

})

module.exports=router;