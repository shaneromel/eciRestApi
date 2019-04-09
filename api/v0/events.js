var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/post", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO events (name, date, time, description) VALUES (?,?,?,?)", [data.name, data.date, data.time, data.description], (err, results, fields)=>{
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

    if(limit&&offset){
        query=`SELECT * FROM events LIMIT ${offset},${limit}`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else if(!offset&&limit){
        query=`SELECT * FROM events LIMIT ${limit}`;
    }else{
        query="SELECT * FROM events";
    }

    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })

});

router.post("/update/:id", (req, res)=>{
    const id=req.params.id;
    const data=req.body;

    db.query("UPDATE events SET name = ?, date = ?, time = ?, description = ? WHERE id = ?", [data.name, data.date, data.time, data.description, id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM events WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;