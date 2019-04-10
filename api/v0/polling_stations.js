var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var redis=require("redis");
var redisClient=redis.createClient();

redisClient.on("error", err=>{
    // console.log(err);
})

router.post("/add", (req, res)=>{
    const data=req.body;

    if(data.start_time<data.end_time){
        db.query("INSERT INTO pollig_stations (title, pincode, start_time, end_time, phone, address, location) VALUES (?,?,?,?,?,?,?)", [data.title, data.pincode, data.start_time, data.end_time, data.phone, data.address, data.location], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            redisClient.GEOADD("polling_stations", JSON.parse(data.location).lng, JSON.parse(data.location).lat, results.insertId, (err, reply)=>{
                if(err){
                    console.log(err)
                    res.send({code:"error", message:err.message});
                    return;
                }

                res.send({code:"success"});  

            })
    
        })
    }else{
        res.send({code:"error", message:"Start time can should be before end time"})
    }

});

router.get("/get", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers["request-type"];

    if(limit&&offset){
        query=`SELECT * FROM pollig_stations LIMIT ${offset},${limit} ORDER BY id DESC`;
    }else if(!offset&&limit){
        query=`SELECT * FROM pollig_stations LIMIT ${limit} ORDER BY id DESC`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else{
        query="SELECT * FROM pollig_stations ORDER BY id DESC";
    }

    db.query(query, [], (err, results, fields)=>{
        if(err){
            if(requestType === "Android") {
                res.send([]);
            } else {
                res.send({code:"error", message:err.message});
            }
            return;
        }

        if(requestType === "Android") {
            res.send(results);
        } else {
            res.send({code:"success", data:results});
        }

    })

});

router.get("/georadius/:lat/:lng/:radius", (req, res)=>{
    const data=req.params;
    const requestType=req.headers["request-type"];

    redisClient.GEORADIUS("polling_stations", data.lng, data.lat, data.radius, "m", (err, reply)=>{
        if(err){
            if(requestType==="Android"){
                res.send([]);
            }else{
                res.send({code:"error", message:err.message});
            }
            return;
        }

        let promises=[];

        reply.forEach(a=>{
            promises.push(getPollingStation(a));
        });

        Promise.all(promises).then(stations=>{
            res.send(stations);
        }).catch(err=>{
            res.send([]);
        })

    })

})

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM pollig_stations WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        redisClient.ZREM("polling_stations", id, (err, reply)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});  

        })

    })

});

router.post("/edit/:id", (req, res)=>{
    const data=req.body;
    const id=req.params.id;
    const start=data.from.split(":");
    const end=data.to.split(":");

    db.query("UPDATE pollig_stations SET title = ?, pincode = ?, start_time = ?, end_time = ?, phone = ?, address = ? WHERE id = ?", [data.title, data.pincode, parseInt(start[0])*60+parseInt(start[1]), parseInt(end[0])*60+parseInt(end[1]), data.phone, data.address, id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

function getPollingStation(id){
    return new Promise((resolve, reject)=>{
        db.query("SELECT * FROM pollig_stations WHERE id = ?", [id], (err, results, fields)=>{
            if(err){
                reject(err);
                return;
            }

            resolve(results[0]);

        })
    })
}

module.exports=router;