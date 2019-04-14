var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var request=require("request");

router.get("/",(req,res)=>{
    let query;
    query = "SELECT * FROM threads";
    const requestType=req.headers['request-type'];
    db.query(query,[],(err, results, fields)=>{
        if(err){
            res.send({code:"error",message:err.message});
            return;
        }
        if(requestType==="Android"){
            res.send(results);
        }else{
            res.send({code:"success", data:results});
        }
    })
});

router.get("/:thread_id", (req,res)=>{
    let query;
    const thread_id = req.params.thread_id;
    const requestType=req.headers['request-type'];
    query = "SELECT * FROM discussion WHERE thread_id = ?";
    db.query(query, [thread_id], (err,results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        if(requestType==="Android"){
            res.send(results);
        }else{
            res.send({code:"success", data:results});
        }
    })
});

//uid //topic
router.post("/", (req,res)=>{
    const data = req.body;
    const uid = data.uid;
    const topic = data.topic;
    db.query("SELECT name FROM members WHERE uid = ? ", [uid], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        const name = results[0].name;
        db.query("INSERT INTO threads (opened_by, topic, name_opened_by) VALUES (?,?,?)",[data.uid, data.topic, name],(err,results,fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }
            res.send({code:"success"});
        })
    })
});

//uid thread_id
router.post("/close", (req, res)=>{
    const data = req.body;
    const uid = data.uid;
    const thread_id = data.thread_id;
    let query;
    db.query("SELECT opened_by FROM threads WHERE id = ?",[thread_id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        if(results[0].opened_by != uid && uid != "admin"){
            res.send({code:"error", message:"You didn't open the thread"})
            return;
        }else{
            db.query("UPDATE threads SET isopened = '0' WHERE id = ?",[thread_id], (err, results, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message})
                    return;
                }
                res.send({code:"success"});
            })
        }
    })
});

//thread_id uid meesage
router.post("/message/:thread_id", (req,res)=>{
    const data = req.body;
    const uid = data.uid;
    const contents = data.content;
    const thread_id = req.params.thread_id;
    isopened(thread_id).then(()=>{
        getnameofuid(uid).then((name)=>{
            db.query("INSERT INTO discussion (thread_id, content, uid, name_by, timestamp) VALUES (?,?,?,?,?)", [thread_id, contents, uid, name, Date.now()], (err, results, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }
                res.send({code:"success"});
            })
        }).catch(message=>{
            res.send({code:"error", message:message});
            return;
        });
    }).catch(a=>{
            res.send({code:"error", message:a});     
            return;
    });
});

var isopened = (thread_id)=>{
    return new Promise((resolve, reject)=>{
        db.query("SELECT isopened FROM threads WHERE id = ?", [thread_id], (err, results, fields)=>{
            if(err){
                reject(err.message);
            }
            if(results.length>0){
                if(results[0].isopened === 1){
                    resolve(true);
                }else{
                    reject("Thread is closed");
                }
            }else{
                reject("Thread doesn't exist");
            }
        })
    })
}

var getnameofuid = (uid)=>{
   return new Promise((resolve, reject)=>{
    db.query("SELECT name FROM members WHERE uid = ?",[uid],(err, results, fields)=>{
        if(err){
            reject("Couldn't get name");
        }
            if(results.length>0){
                resolve(results[0].name);
            }else{
                reject("User doesn't exist");
            }
        });
   })
}

module.exports = router;