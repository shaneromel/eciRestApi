var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.get("/", (req, res)=>{
    let query;
    const requestType=req.headers['request-type'];

    query = "SELECT * FROM groups;"

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

router.post("/creategroup", (req, res)=>{ //name
    const data=req.body;
    let query = "CREATE TABLE "+"group_? (id int(11) auto_increment, uid varchar(50) not null, primary key(id)); INSERT INTO groups (title) VALUES (?); ";
    db.query(query, [data.title, data.title], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        res.send({code:"success"});
    })

});

module.exports=router;