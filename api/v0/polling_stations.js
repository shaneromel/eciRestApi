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

    db.query("INSERT INTO pollig_stations (title, pincode, phone, address, location, blo_name, ps_image, no_of_voters, no_of_pwd_voters, booth_number, assembly, block) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [data.title, data.pincode, data.phone, data.address, data.location, data.blo_name, data.ps_images, data.voters, data.pwd_voters, data.booth_number, data.assembly, data.block], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        redisClient.GEOADD("polling_stations", JSON.parse(data.location).lng, JSON.parse(data.location).lat, results.insertId, (err, reply)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});  

        })

    })

});

router.get("/get", (req, res)=>{
    let query;
    const assembly=req.query.assembly;
    const block=req.query.block;
    const requestType=req.headers["request-type"];

    if(assembly&&block){
        query=`SELECT * FROM pollig_stations WHERE assembly = '${assembly}' AND block = '${block}'`;
    }else if(assembly&&!block){
        query=`SELECT * FROM pollig_stations WHERE assembly = '${assembly}'`;
    }else if(block&&!assembly){
        query=`SELECT * FROM pollig_stations WHERE block = '${block}'`;
    }else{
        query=`SELECT * FROM pollig_stations`;
    }

    // if(limit&&offset){
    //     query=`SELECT * FROM pollig_stations LIMIT ${offset},${limit} ORDER BY id DESC`;
    // }else if(!offset&&limit){
    //     query=`SELECT * FROM pollig_stations LIMIT ${limit} ORDER BY id DESC`;
    // }else if(!limit&&offset){
    //     res.send({code:"error", message:"Limit should be supplied with offset"});
    //     return;
    // }else{
    //     query="SELECT * FROM pollig_stations ORDER BY id DESC";
    // }


    db.query(query, [], (err, results, fields)=>{
        if(err){
            if(requestType === "Android") {
                res.send([]);
            } else {
                res.send({code:"error", message:err.message});
            }
            return;
        }

        results=results.map(a=>{
            a.images=a.ps_image.split(",");
            delete a.ps_image;
            return a;
        });

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

    db.query("UPDATE pollig_stations SET title = ?, pincode = ?, phone = ?, address = ?, no_of_voters = ?, no_of_pwd_voters = ?, booth_number = ? , blo_name = ?, assembly = ?, block = ? WHERE id = ?", [data.title, data.pincode, data.phone, data.address, data.no_of_voters, data.no_of_pwd_voters, data.booth_number, data.blo_name, data.assembly, data.block, id], (err, results, fields)=>{
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