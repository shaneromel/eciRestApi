var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

//group_title assesment_name enable
router.post("/", (req,res)=>{
    const data = req.body;
    const table_name = data.assesment_name.replace(/ /g,"_");
    let query;
    query = "CREATE TABLE assesment_"+table_name+" (id int not null auto_increment, question varchar(100) not null, opt1 varchar(50) not null, opt2 varchar(50) not null, opt3 varchar(50) not null, opt4 varchar(50) not null, correct_opt int not null, primary key(id))";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code: "error", message:err.message});
            return;
        }
        db.query("INSERT INTO assesments (group_title, assesment_name, enable, start_timestamp, end_timestamp) VALUES (?,?,?,?,?)", [data.group_title, data.assesment_name, data.enable, data.start_timestamp, data.end_timestamp],(err, results, fields)=>{
            if(err){
                res.send({code: "error", message:err.message});
                return;
            }

            res.send({code: "success"})

        })
    }) 
});

router.get("/", (req, res)=>{
    let query;
    query = "SELECT * FROM assesments";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code: "error", message: err.message});
            return;
        }
        res.send({code:"success", data:results})
    })
});

router.get("/scores", (req, res)=>{
    db.query("SELECT assesment_name, name, score, assesment_id, members.uid FROM scores, assesments, members WHERE scores.assesment_id = assesments.id AND scores.uid = members.uid", [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
})

router.get("/:group_title", (req, res)=>{
    const group_title = req.params.group_title;
    let query;
    const requestType=req.headers["request-type"];
    query = "SELECT * FROM assesments WHERE group_title = ?";
    db.query(query, [group_title], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        if(requestType === "Android") {
            res.send(results);
        } else {
            res.send({code:"success", data:results});
        }
    });
})

//assesment_name question opt1 opt2 opt3 opt4 correct_opt
router.post("/addquestion", (req, res)=>{
    const data = req.body;
    let query ;
    const table_name = data.assesment_name.replace(" ","_");
    query = "INSERT INTO assesment_"+table_name+" (question, opt1, opt2, opt3, opt4, correct_opt) VALUES (?,?,?,?,?,?)";
    db.query(query, [data.question, data.opt1, data.opt2, data.opt3, data.opt4, data.ro], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message: err.message});
            return;
        }
        res.send({code: "success"})
    })

});

router.get("/questions/:assessment_name", (req, res)=>{
    const assessmentName=req.params.assessment_name.replace(" ","_");
    const requestType=req.headers['request-type'];
    db.query(`SELECT * FROM assesment_${assessmentName}`, [], (err, results, fields)=>{
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

//uid assesment_name question_id selected
router.post("/submit", (req, res)=>{
    const data=req.body;

    db.query("SELECT assesment_name FROM assesments WHERE id = ?", [data.assesment_id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(results.length>0){
            let promises=[];
            const assessmentName=results[0].assesment_name;
               
            data.response.forEach(a=>{
                promises.push(validateAnswer(a, assessmentName));
            });

            Promise.all(promises).then(result=>{
                let score=0;

                results.forEach(a=>{
                    if(a.is_correct){
                        score=score+1;
                    }
                });

                db.query("INSERT INTO scores (assesment_id, score, uid) VALUES (?,?,?)", [assessmentName, (score/data.response.length)*100, data.uid], (err, results, fiedls)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    res.send({code:"success"});                    

                })
            }).catch(err=>{
                res.send({code:"error", message:err.message});
            })
        }else{
            res.send({code:"error", message:"No such assessment exists"})
        }

    })

})

router.post("/edit-question", (req, res)=>{
    const data=req.body;
    const table_name = data.assesment_name.replace(" ","_");
    db.query(`UPDATE assesment_${table_name} SET question = ?, opt1 = ?, opt2 = ?, opt3 = ?, opt4 = ?, correct_opt = ? WHERE id = ?`, [data.question, data.opt1, data.opt2, data.opt3, data.opt4, data.ro, data.id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.delete("/question/:id/:assessment_name", (req, res)=>{
    const id=req.params.id;
    const assessmentName=req.params.assessment_name.replace(" ","_");

    db.query(`DELETE FROM assesment_${assessmentName} WHERE id = ?`, [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        res.send({code:"success"});

    })

});

router.delete("/:assessment_name", (req, res)=>{
    const assessmentName=req.params.assessment_name;
    const table_name = assessmentName.replace(" ","_");
    db.query("DELETE FROM assesments WHERE assesment_name = ?", [assessmentName], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        db.query(`DROP TABLE assesment_${table_name}`, [], (err, results, fields)=>{
            if(err){
                res.send({code:"error", message:err.message});
                return;
            }

            res.send({code:"success"});

        })

    })

})

function validateAnswer(data, assessmentName){
    assessmentName = assessmentName.replace(" ","_");
    return new Promise((resolve, reject)=>{
        db.query(`SELECT * FROM assesment_${assessmentName} WHERE id = ? AND correct_opt = ?`, [data.question, data.opt_selected], (err, results, fields)=>{
            if(err){
                reject(err);
                return;
            }
            resolve({question_id:data.question, is_correct:results.length>0 ? true : false})

        })
    })
}

module.exports = router;