var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/", (req,res)=>{
    const timestamp=req.body.date ? (new Date(req.body.date)).getTime() : Date.now();

    db.query("INSERT INTO magazines (pdf, timestamp, date_string) VALUES (?,?,?)", [req.body.pdf, timestamp, (new Date(timestamp)).toDateString()], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })
});

router.post("/discreetion", (req,res)=>{
    const timestamp=parseInt(req.body.timestamp);

    db.query("INSERT INTO magazines (pdf, timestamp, date_string) VALUES (?,?,?)", [req.body.pdf, timestamp, (new Date(timestamp)).toDateString()], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })
})

router.get("/", (req, res)=>{
    db.query("SELECT * FROM magazines ORDER BY timestamp DESC", [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(req.headers['request-type']==="Android"){
            res.send(results)
        }else{
            res.send({code:"success", data:results});
        }
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