var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/add", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO candidates (name,district,image,symbol) VALUES (?,?,?,?)", [data.name, data.district, data.image, data.symbol], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })    

});

router.get("/get", (req, res)=>{

    const requestType=req.headers['request-type'];

    db.query("SELECT * FROM candidates", [], (err, results, fields)=>{
        if(err){
            if(requestType==="Android"){
                res.send([])
            }else{
                res.send({code:"error", message:err.message});
            }
            return;
        }

        if(requestType==="Android"){
            res.send(results);
        }else{
            res.send({code:"success", data:results});
        }

    })
});

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM candidates WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;