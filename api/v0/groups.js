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


module.exports=router;