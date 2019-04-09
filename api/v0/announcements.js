var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var timeConverter=require("../../utils/time_converter");

router.post("/post", (req, res)=>{
    const data=req.body;
    const dateArray=req.body.date.split("-");
    const time=`${data.time.split(" ")[0]}:00${data.time.split(" ")[1]==="am" ? "AM" : "PM"}`;

    const convertedTime=timeConverter(time);
    const date=new Date(dateArray[0], dateArray[1], dateArray[2], convertedTime.hour, convertedTime.min, 0);
    
    db.query("INSERT INTO announcements (title, date, time, timestamp) VALUES (?,?,?,?)", [data.title, data.date, data.time, date.getTime()], (err, results, fields)=>{
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
        query=`SELECT * FROM announcements LIMIT ${offset},${limit} ORDER BY id DESC`;    
    }else if(!offset&&limit){
        query=`SELECT * FROM announcements LIMIT ${limit} ORDER BY id DESC`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else{
        query="SELECT * FROM announcements ORDER BY id DESC";
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

})

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM announcements WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;