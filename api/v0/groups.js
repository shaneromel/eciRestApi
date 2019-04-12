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

router.delete("/", (req, res)=>{
    let query;
    let query2;
    const data = req.body;
    const requestType = req.headers['request-type'];
    query = "DROP TABLE "+"group_"+data.title ;
    db.query(query,[], (err,results, fields)=>{
        if(err){
            res.send({code:"error" ,  message: "No such group exists"});
            return;
        }
        query2 = "DELETE FROM groups where title='"+data.title+"'";
        db.query(query2, [], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
    })
});

router.post("/creategroup", (req, res)=>{ //name
    const data=req.body;
    let query = "CREATE TABLE "+"group_"+data.title+" (id int(11) auto_increment, uid varchar(50) not null, primary key(id), foreign key (uid) references members(uid), CONSTRAINT members_unique UNIQUE (uid))";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        db.query("INSERT INTO groups (title) VALUES ('"+data.title+"')", [], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })
    })

});

//uid, group_title
router.post("/adduser", (req,res)=>{
    const data=req.body;
    let query = "INSERT INTO group_"+data.title+" (uid) VALUES ('"+data.uid+"')";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

    })
});

module.exports=router;