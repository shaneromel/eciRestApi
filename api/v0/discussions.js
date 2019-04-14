var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var request=require("request");

router.get("/",(req,res)=>{
    let query;
    query = "SELECT * FROM threads";
    const requestType=req.headers['request-type'];
    db.query(query,[],(err, results, fields)=>{
        if(err){
            res.send({code:"error",message:err.message});
            return;
        }
        if(requestType==="Android"){
            res.send(results);
        }else{
            res.send({code:"success", data:results});
        }
    })
});

router.get("/:thread_id", (req,res)=>{
    let query;
    const thread_id = req.params.thread_id;
    const requestType=req.headers['request-type'];
    query = "SELECT * FROM discussion WHERE thread_id = ?";
    db.query(query, [thread_id], (err,results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        if(requestType==="Android"){
            res.send(results);
        }else{
            res.send({code:"success", data:results});
        }
    })
});

router.delete("/:thread_id/:uid", (req,res)=>{
    let query;
    const thread_id = req.params.thread_id;
    const uid = req.params.uid;
    db.query("SELECT * FROM discussion where ", (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

    })
})



module.exports = router;