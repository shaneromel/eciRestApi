var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.get("/vod-feeds", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers['request-type'];

    if(limit&&offset){
        query=`SELECT ${requestType==="Android" ? 'name, image, timestamp' : '*'} FROM voter_of_day_data LIMIT ${offset},${limit}`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else if(!offset&&limit){
        query=`SELECT ${requestType==="Android" ? 'name, image, timestamp' : '*'} FROM voter_of_day_data LIMIT ${limit}`;
    }else{
        query=`SELECT ${requestType==="Android" ? 'name, image, timestamp' : '*'} FROM voter_of_day_data`;
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

router.post("/post", (req,res)=>{
    const data=req.body;

    db.query("INSERT INTO voter_of_day_data (name, image, timestamp, content) VALUES (?,?,?,?)", [data.name, data.image, Date.now(), data.content], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.post("/select-vod", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO selected_voter (id, date, date_string) VALUES (?,?,?)", [data.id, data.date, (new Date(data.date).toDateString())], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.get("/is-vod/:id", (req, res)=>{
    const  id=req.params.id;

    db.query("SELECT * FROM selected_voter WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(results.length>0){
            res.send({code:true});
        }else{
            res.send({code:false});
        }

    })

});

router.delete("/vod-feed/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM voter_of_day_data WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;