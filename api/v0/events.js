var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var timeConverter=require("../../utils/time_converter");
var translate=require("../../utils/translate");
var request=require("request");

router.post("/post", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO events (name, date, time, description, end_date, end_time, link) VALUES (?,?,?,?,?,?,?)", [data.name, data.date, data.time, data.description, data.end_date, data.end_time, data.link ? data.link : '-'], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

        request.post(`${process.env.REST_API}/notifications/send`, {headers:{is_server:true}, json:{title:data.name, message:data.description, topic:"events"}}, (err, response,body)=>{
            if(err){
                console.log(err);
                return;
            }

            console.log(response.body);

        })

    })

});

router.get("/get", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers['request-type'];
    const language=req.headers.language;

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

        const texts=[];
        const promises=[];

        results=results.map(a=>{
            a.start_timestamp=dateToTimestamp(a.date, a.time);
            a.end_timestamp=dateToTimestamp(a.end_date, a.end_time);
            if(language==="hi"){
                const keys=Object.keys(a);
                const selectedKeys=[];
                
                keys.forEach(d=>{
                    if(typeof a[d]==="string"&&d==="description"){
                        texts.push(a[d]);
                        selectedKeys.push(d);
                    }
                });

                promises.push(translate.translate(texts, language));
                a.selected_keys=selectedKeys;
            }
            return a;
        });

        if(language==="hi"){
            Promise.all(promises).then(translations=>{
                let c=0;
                results=results.map(result=>{
                    let k=0;
                    result.selected_keys.forEach(key=>{
                        result[key]=translations[c][0][k];
                        k++;
                    })
                    c++;
                    return result;
                });

                results=results.map(a=>{
                    delete a.selected_keys;
                    return a;
                })

                res.send(results);
            }).catch(err=>{
                res.send(results);
            })
        }else{
            if(requestType==="Android"){
                res.send(results)
            }else{
                res.send({code:"success", data:results});
            }
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

});

router.get("/interested-count/:id", (req, res)=>{
    const id=req.params.id;

    db.query("SELECT COUNT(*) FROM interested WHERE event_id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", count:results[0]["COUNT(*)"]});

    })

});

// router.post("/interested", (req, res)=>{
//     const data=req.body;

//     db.query("INSERT INTO interested (event_id, device_id) VALUES (?,?)", [data.event_id, data.device_id], (err, results, fields)=>{
//         if(err){
//             res.send({code:"error", message:err.message});
//             return;
//         }

//         res.send({code:"success"});

//     })

// });

router.post("/interested", (req, res)=>{
    const id=req.body.id, data=req.body;

    db.query(`UPDATE events SET interested = interested + ${data.interested}, not_interested = not_interested + ${data.not_interested} WHERE id = ?`, [id], (err, results, fields)=>{
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

    const formattedDate=new Date(dateArray[2], dateArray[0], dateArray[1], convertedTime.hour, convertedTime.min, 0);

    return formattedDate.getTime();

}

module.exports=router;