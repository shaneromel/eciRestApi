var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var admin=require("firebase-admin");

//message group_title
router.post("/", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO messages (group_title, message, timestamp) VALUES (?,?,?)", [data.group_title, data.message, Date.now()], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        db.query(`SELECT * FROM group_${data.group_title.replace(/ /g, "_")}`, [], (err, results, fields)=>{
            if(err){
                console.log(err);
                return;
            }

            if(results.length>0){
                let promises=[];

                results.forEach(a=>{
                    promises.push(new Promise((resolve, reject)=>{
                        db.query("SELECT token FROM members WHERE uid = ?", [a.uid], (err, results, fields)=>{
                            if(err){
                                reject(err);
                                return;
                            }

                            resolve(results[0].token);

                        })
                    }))
                });

                Promise.all(promises).then(tokens=>{

                    tokens=tokens.filter(a=>a);

                    const notificationData={
                        notification:{
                            title:`Message from group ${data.group_title}`,
                            body:data.message
                        }
                    };

                    admin.messaging().sendToDevice(tokens, notificationData).then(()=>{
                        console.log("Notification sent");
                    }).catch(err=>{
                        console.log(err)
                    })
                })

            }

        })

        res.send({code:"success"});

    })

});

//order=DESC
router.get("/:group_title", (req,res)=>{
    const group_title = req.params.group_title;
    const order=req.query.order ? req.query.order : 'ASC';
    const requestType=req.headers['request-type'];

    db.query("SELECT * FROM messages WHERE group_title = ? ORDER BY timestamp "+order, [group_title], (err, results, fields)=>{
        if(err){
            if(requestType==="Android"){
                res.send([]);
            }else{
                res.send({code: "error", message:err.message});
            }
            return;
        }
        
        if(requestType==="Android"){
            res.send(results);
        }else{
            res.send({code:"success", data: results})
        }

    })
});

//id
router.delete("/:id", (req,res)=>{
    const id = req.params.id;
    db.query("DELETE FROM messages WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code: "error", message : err.message});
            return;
        }
        res.send({code:"success"})
    })
});

//group_title
router.delete("/all/:group_title",(req,res)=>{
    const group_title = req.params.group_title;
    db.query("DELETE FROM messages WHERE group_title = ?", [group_title], (err, results, fields)=>{
        if(err){
            res.send({code: "error", message : err.message});
            return;
        }
        res.send({code: "success"})
    })
});

//group_title
router.delete("/lastmessage/:group_title", (req,res)=>{
    const group_title = req.params.group_title;
    let query;
    query = "DELETE FROM messages WHERE group_title='"+group_title+"' ORDER BY id DESC LIMIT 1";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code: "error", message: err.message});
        }
        res.send({code: "success"})
    })
});
module.exports=router;