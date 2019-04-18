var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var request=require("request");

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
    const table_name = data.title.replace(/ /g,"_");
    query = "DROP TABLE "+"group_"+table_name;
    query2 = "DELETE FROM groups where title='"+data.title+"'";
    let promises1=[];

    db.query(`SELECT uid, from group_${table_name}`, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        results.forEach(something=>{
            promises1.push(deletegroupfromusers(something.uid, data.title));
        });

        Promise.all(promises1).then(result=>{
            db.query(query,[], (err,results, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }
        
                let promises=[];
                
                db.query("SELECT assesment_name FROM assesments WHERE group_title = ?", [data.title], (err, results, fields)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }
        
                    results.forEach(a=>{
                        promises.push(deleteAssessment(a.assesment_name));
                    });
        
                    Promise.all(promises).then(()=>{
        
                        request.delete(`${process.env.REST_API}/messages/all/${data.title}`, {headers:{is_server:true}}, (err, response, body)=>{
                            if(err){
                                res.send({code:"error", message:err.message});
                                return;
                            }
        
                            db.query(query2, [], (err, results, fields)=>{
                                if(err){
                                    res.send({code:"error", message:err.message})
                                    return;
                                }
            
                                if(JSON.parse(response.body).code==="success"){
                                    res.send({code:"success"})
                                }else{
                                    res.send({code:"error", message:response.body.message});
                                }
                    
                            })
        
                        })
                    }).catch(err=>{
                        res.send({code:"error", message:err.message});
                    })
        
                })
                
            })
        }).catch(err=>{
            res.send({code:"error", message: err.message});
            console.log(err)
        })

    })

});

router.post("/creategroup", (req, res)=>{ //name
    const data=req.body;
    const table_name = data.title.replace(/ /g,'_');
    let query = "CREATE TABLE "+"group_"+table_name+" (id int(11) auto_increment, uid varchar(50) not null, primary key(id), foreign key (uid) references members(uid), CONSTRAINT members_unique UNIQUE (uid))";
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
    const table_name = data.group_title.replace(/ /g,"_");
    let query = "INSERT INTO group_"+table_name+" (uid) VALUES ('"+data.uid+"')";
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
    const table_name = data.grouptitle.replace(/ /g, "_");
    let query = "DELETE FROM group_"+table_name+" WHERE uid ='"+data.uid+"'";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        db.query("SELECT groups_in FROM members WHERE uid = ?", [data.uid], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            let groupsIn=results[0].groups_in.split(",");
            groupsIn=groupsIn.filter(a=>a!=data.grouptitle).toString();

            db.query("UPDATE members SET groups_in = ? WHERE uid = ?", [groupsIn, data.uid], (err, results, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }

                res.send({code:"success"});

            })

        })
    })
});

router.get("/members/:title", (req, res)=>{
    const title=req.params.title;
    const table_name = title.replace(/ /g,"_");
    db.query(`SELECT * FROM group_${table_name}`, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })

});

function deleteAssessment(assessmentName){
    return new Promise((resolve, reject)=>{
        request.delete(`${process.env.REST_API}/assesments/${assessmentName}`, {headers:{is_server:true}}, (err, response, body)=>{
            if(err){
                reject(err);
                return;
            }

            const res=JSON.parse(response.body);

            if(res.code==="success"){
                resolve(res);
            }else{
                reject(res);
            }

        })
    })
}

var deletegroupfromusers = (uid, group_name)=>{
    return new Promise((resolve, reject)=>{
        db.query("SELECT groups_in FROM members WHERE uid = ?", [uid], (err, results, fields)=>{
            if(err){
                reject({code:"error", message:err.message});
                return;
            }

            let groups_inside=results[0].groups_in.split(",");
            groups_inside=groups_inside.filter(a=>a!=group_name).toString();

            db.query("UPDATE members SET groups_in = ? WHERE uid = ?", [groups_inside, uid], (err, results, fields)=>{
                if(err){
                    reject({code:"error", message:err.message});
                    return;
                }

                resolve({code:"success"});

            })

        })
    })
}

module.exports=router;