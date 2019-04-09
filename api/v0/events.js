var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var timeConverter=require("../../utils/time_converter");

router.post("/post", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO events (name, date, time, description, end_date, end_time, link) VALUES (?,?,?,?,?,?,?)", [data.name, data.date, data.time, data.description, data.end_date, data.end_time, data.link ? data.link : '-'], (err, results, fields)=>{
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
    const requestType=req.headers['request-type'];

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
            if(requestType==="Android"){
                res.send([]);
            }else{
                res.send({code:"error", message:err.message});
            }
            return;
        }

        results=results.map(a=>{
            a.start_timestamp=dateToTimestamp(a.date, a.time);
            a.end_timestamp=dateToTimestamp(a.end_date, a.end_time);
            return a;
        })

        if(requestType==="Android"){
            res.send(results)
        }else{
            res.send({code:"success", data:results});
        }

    })

});

router.post("/update/:id", (req, res)=>{
    const id=req.params.id;
    const data=req.body;

    db.query("UPDATE events SET name = ?, date = ?, time = ?, description = ?, end_date = ?, end_time = ?, link = ? WHERE id = ?", [data.name, data.date, data.time, data.description, data.end_date, data.end_time, data.link ? data.link : '-', id], (err, results, fields)=>{
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

function dateToTimestamp(date, time){
    const dateArray=date.split("/");
    const formattedTime=`${time.split(" ")[0]}:00${time.split(" ")[1]==="am" ? "AM" : "PM"}`;

    const convertedTime=timeConverter(formattedTime);

    const formattedDate=new Date(dateArray[2], dateArray[1], dateArray[0], convertedTime.hour, convertedTime.min, 0);

    return formattedDate.getTime();

}

module.exports=router;