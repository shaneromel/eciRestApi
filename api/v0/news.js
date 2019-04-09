var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/post", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO news (title, description, content, timestamp, image) VALUES (?,?,?,?,?)", [data.title, data.description, data.content, Date.now(), data.image], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.get("/get", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers["request-type"];

    if(limit&&offset){
        query=`SELECT * FROM news LIMIT ${offset},${limit} ORDER BY id DESC`;
    }else if(limit&&!offset){
        query `SELECT * FROM news LIMIT ${limit} ORDER BY id DESC`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be provided alongwith offset"});
        return;
    }else{
        query="SELECT * FROM news ORDER BY id DESC";
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

    });

})

router.post("/edit/:id", (req, res)=>{
    const data=req.body;
    const id=req.params.id;

    db.query("UPDATE news SET title = ?, description = ?, content = ? WHERE id = ?", [data.title, data.description, data.content, id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM news WHERE id = ?", [id], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;