var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

router.post("/add", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO contacts (name, email, phone, priority, designation, ofc_no, fax) VALUES (?,?,?,?,?,?,?)", [data.name, data.email ? data.email : '-', data.phone, data.priority, data.designation, data.ofc_no, data.fax], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"})

    })

});

router.get("/get", (req, res)=>{
    const limit=req.query.limit;
    const offset=req.query.offset;
    let query;
    const requestType=req.headers['request-type'];
    
    if(limit&&offset){
        query=`SELECT * FROM contacts LIMIT ${offset},${limit} ORDER BY priority`;
    }else if(!limit&&offset){
        res.send({code:"error", message:"Limit should be supplied with offset"});
        return;
    }else if(!offset&&limit){
        query=`SELECT * FROM contacts LIMIT ${limit} ORDER BY priority`;
    }else{
        query="SELECT * FROM contacts ORDER BY priority";
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

        if(requestType==="Android"){
            res.send(results);
        }else{
            res.send({code:"success", data:results});
        }

    })

});

router.post("/update/:id", (req, res)=>{
    const data=req.body;
    const id=req.params.id;

    db.query("UPDATE contacts SET email = ?, phone = ?, priority = ?, designation = ?, ofc_no = ?, fax = ? WHERE id = ?", [data.email ? data.email : '-', data.phone, data.priority, data.designation, data.ofc_no, data.fax, id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

router.delete("/delete/:id", (req, res)=>{
    const id=req.params.id;

    db.query("DELETE FROM contacts WHERE id = ?", [id], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

module.exports=router;