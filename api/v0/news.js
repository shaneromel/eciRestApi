var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var translate=require("../../utils/translate");

router.post("/post", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO news (title, description, content, timestamp, image) VALUES (?,?,?,?,?)", [data.title, data.description, data.content, Date.now(), data.image], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.get("/get", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers["request-type"];
    const language=req.headers.language;

    if(limit&&offset){
        query=`SELECT * FROM news LIMIT ${offset},${limit} ORDER BY id DESC`;
    }else if(limit&&!offset){
        query `SELECT * FROM news LIMIT ${limit} ORDER BY id DESC`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be provided alongwith offset"});
        return;
    }else{
        query="SELECT * FROM news ORDER BY id DESC";
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
            if(language==="hi"){
                const keys=Object.keys(a);
                const selectedKeys=[];
                
                keys.forEach(d=>{
                    if(d==="title"||d==="description"){
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

    });

})

router.post("/edit/:id", (req, res)=>{
    const data=req.body;
    const id=req.params.id;

    db.query("UPDATE news SET title = ?, description = ?, content = ? WHERE id = ?", [data.title, data.description, data.content, id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM news WHERE id = ?", [id], (err, result, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;