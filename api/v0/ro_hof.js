var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.get("/", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers['request-type'];

    if(limit&&offset){
        query=`SELECT * FROM ro_hall_of_fame LIMIT ${offset},${limit} ORDER BY timestamp DESC`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else if(!offset&&limit){
        query=`SELECT * FROM ro_hall_of_fame LIMIT ${limit} ORDER BY timestamp DESC`;
    }else{
        query="SELECT * FROM ro_hall_of_fame ORDER BY timestamp DESC";
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

router.post("/", (req,res)=>{
    const data=req.body;

    db.query("INSERT INTO ro_hall_of_fame(name, image, timestamp, content) VALUES (?,?,?,?)", [data.name, data.image, data.date ? (new Date(data.date)).getTime() : Date.now(), data.content], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.delete("/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM ro_hall_of_fame WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"})

    })

})

module.exports=router;