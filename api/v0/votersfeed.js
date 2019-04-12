var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.get("/", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers['request-type'];

    if(limit&&offset){
        query=`SELECT id,name,image,timestamp FROM voters_feed WHERE isactive = 1 LIMIT ${offset},${limit} ORDER BY timestamp DESC`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else if(!offset&&limit){
        query=`SELECT id,name,image,timestamp FROM voters_feed  WHERE isactive = 1 LIMIT ${limit} ORDER BY timestamp DESC`;
    }else{
        query="SELECT id,name,image,timestamp FROM voters_feed WHERE isactive = 1 ORDER BY timestamp DESC";
    }

    db.query(query, [], (err, results, fields)=>{
        if(err){
            if(requestType==="Android"){
                res.send([]);
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

router.get("/:id", (req, res)=>{
    const id = req.params.id;
    const requestType=req.headers['request-type'];

    db.query("SELECT id,name,image,timestamp,content FROM voters_feed WHERE id = ? AND isactive = 1", [id], (err, results, fields)=>{
        if(err){
            if(requestType==="Android"){
                res.send([]);
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

router.post("/", (req,res)=>{
    const data=req.body;
    if(data.image==null && data.content== null){
        res.send({code:"err", message: "Please insert Image or Content!"});
    }else{
        db.query("INSERT INTO voters_feed (name, image, timestamp, content) VALUES (?,?,?,?)", [data.name, data.image, Date.now(), data.content], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }
            res.send({code:"success"});
        })
    }

});

module.exports=router;