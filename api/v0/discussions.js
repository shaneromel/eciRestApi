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

//uid //topic
router.post("/", (req,res)=>{
    const data = req.body;
    const uid = data.uid;
    const topic = data.topic;
    let query;
    db.query("SELECT name FROM members WHERE uid = ? ", [uid], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        const name = results[0].name;
        db.query("INSERT INTO discussion (opened_by, topic, name_opened_by) VALUES (?,?,?)",[data.uid, data.topic, name],(err,results,fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }
            res.send({code:"success"});
        })
    })
});



module.exports = router;