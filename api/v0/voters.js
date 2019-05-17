var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var request=require("request");

router.get("/vod-feeds", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers['request-type'];

    if(limit&&offset){
        query=`SELECT * FROM voter_of_day_data LIMIT ${offset},${limit}`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else if(!offset&&limit){
        query=`SELECT * FROM voter_of_day_data LIMIT ${limit}`;
    }else{
        query=`SELECT * FROM voter_of_day_data`;
    }

    db.query(query+" ORDER BY timestamp DESC", [], (err, results, fields)=>{
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

router.post("/vod", (req,res)=>{
    const data=req.body;
    const timestamp=Date.now();
    const date=new Date(timestamp);
    const dateString=(new Date(date.getFullYear(), date.getMonth(), date.getDate())).toDateString();

    db.query("INSERT INTO voter_of_day_data (name, image, timestamp, content, date_string) VALUES (?,?,?,?,?)", [data.name, data.image, timestamp, data.content, dateString], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.post("/vod-admin", (req, res)=>{
    const data=req.body;
    const date=req.body.date.split("/");
    const month=parseInt(date[0]);
    const day=parseInt(date[1]);
    const year=parseInt(date[2]);
    const dateObj=new Date(year, month-1, day);

    db.query("INSERT INTO voter_of_day_data (name, image, timestamp, content, date_string) VALUES (?,?,?,?,?)", [data.name, data.image, dateObj.getTime(), data.content, dateObj.toDateString()], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

router.post("/select-vod", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO selected_voter (id, date, date_string) VALUES (?,?,?)", [data.id, data.date, (new Date(data.date)).toDateString()], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        db.query("SELECT image,name FROM voter_of_day_data WHERE id = ?", [data.id], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            if(results.length>0){
                request.post("https://graph.facebook.com/v3.2/2188982481214711/photos?access_token=EAACp9LJOuIkBAK1SfppptDval2RfBbFsbcyI8Xis4ANHbZBgKsBCGjyS52hL73iZAGAmvSbMu51LlgGFFjfIzCI6ZBYal7shq7m76JZAm8IsoYyfP8ZACtq3jIxmwz0aV6WSpZCZCFUmJa2dC53TIaZClUxka9ZCgQet6gyWqLknXEOTPxvsqJtYzXZCo6ZBraHQZCwDhq3sz1Q4IwZDZD", {json:{url:results[0].image, caption:"Voter of the day"}}, (err, response, body)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    const notificationData={
                        image:results[0].image,
                        title:results[0].name,
                        message:"Voter of the day",
                        topic:"others"
                    };

                    request.post(`${process.env.REST_API}/notifications/send`, {json:notificationData, headers:{is_server:true}}, (err, response, body)=>{
                        if(err){
                            console.log(err);
                            return;
                        }
                    })

                    res.send({code:"success"});

                })
            }else{
                res.send({code:"error", message:"No such submission exists"})
            }

        })

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

    db.query("DELETE FROM selected_voter WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        db.query("DELETE FROM voter_of_day_data WHERE id = ?", [id], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }
    
            res.send({code:"success"});
    
        })

    })

});

router.get("/vod", (req, res)=>{
    const requestType=req.headers['request-type'];
 
    db.query(`SELECT name,image,timestamp,id FROM voter_of_day_data WHERE id IN (SELECT id FROM selected_voter) ORDER BY timestamp DESC`, [], (err, results, fields)=>{
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

router.get("/vod/:id", (req, res)=>{
    const id=req.params.id;
    const requestType=req.headers['request-type'];

    db.query("SELECT * FROM voter_of_day_data WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            if(requestType==="Android"){
                res.send([]);
            }else{
                res.send({code:"error", message:err.message});
            }
            return;
        }

        if(requestType==="Android"){
            res.send(results[0]);
        }else{
            res.send({code:"success", data:results[0]});
        }

    })

});

router.get("/today-vod-submissions", (req, res)=>{
    const date=(new Date()).toDateString();

    db.query("SELECT * FROM voter_of_day_data WHERE date_string = ?", [date], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })

});

router.post("/vod-selected", (req, res)=>{
    const dateString=req.body.date_string;

    db.query("SELECT COUNT(*) FROM selected_voter WHERE date_string = ?", [dateString], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(results[0]["COUNT(*)"]>0){
            res.send({code:true});
        }else{
            res.send({code:false});
        }

    })

})

router.get("/vod-selected-today", (req, res)=>{
    const date=(new Date()).toDateString();

    db.query("SELECT COUNT(*) FROM selected_voter WHERE date_string = ?", [date], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(results[0]["COUNT(*)"]>0){
            res.send({code:true});
        }else{
            res.send({code:false})
        }

    })

})

module.exports=router;