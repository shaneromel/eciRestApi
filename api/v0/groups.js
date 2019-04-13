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

router.delete("/:title", (req, res)=>{
    let query;
    let query2;
    const data = req.params;

    query = "DROP TABLE "+"group_"+data.title ;
    query2 = "DELETE FROM groups where title='"+data.title+"'";

    let promises=[new Promise((resolve, reject)=>{
        db.query(query,[], (err,results, fields)=>{
            if(err){
                reject(err)
                return;
            }
            resolve()
        })
    }), new Promise((resolve, reject)=>{
        db.query(query2, [], (err, results, fields)=>{
            if(err){
                reject(err);
                return;
            }

            resolve();

        })
    })];

    Promise.all(promises).then(()=>{
        res.send({code:"success"});
    }).catch(err=>{
        res.send({code:"error", message:err.message})
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
    let query = "INSERT INTO group_"+data.group_title+" (uid) VALUES ('"+data.uid+"')";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        db.query("UPDATE members SET groups_in = CONCAT(groups_in , '"+","+data.group_title+"') WHERE uid = ?", [data.uid], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    })
});


//uid, group_title
router.delete("/removeuser/:grouptitle/:uid",(req, res)=>{
    const data = req.params;
    let query = "DELETE FROM group_"+data.grouptitle+" WHERE uid ='"+data.uid+"'";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        res.send({code:"success"})
    })
});

router.get("/members/:title", (req, res)=>{
    const title=req.params.title;

    db.query(`SELECT * FROM group_${title}`, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })

})
module.exports=router;