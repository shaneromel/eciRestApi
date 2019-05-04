var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/", (req,res)=>{
    const timestamp=Date.now();

    db.query("INSERT INTO magazines (image, pdf, timestamp) VALUES (?,?,?)", [req.body.image, req.body.pdf, timestamp, (new Date(timestamp).toDateString())], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })
});

router.get("/", (req, res)=>{
    db.query("SELECT * FROM magazines", [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
});

router.get("/today", (req, res)=>{
    const dateString=(new Date()).toDateString();

    db.query("SELECT * FROM magazines WHERE date_string = ?", [dateString], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send(results);

    })

});

router.delete("/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM magazines WHERE id = ?", [id], (err, result, fields)=>{
        if(err){
            res.send({code:"error" , message:err.message});
            return;
        }

        res.send({code:"success"});

    })
})

module.exports=router;