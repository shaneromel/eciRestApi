var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var uniqid=require("uniqid");

router.post("/", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO members (uid, name, designation, image, email, phone) VALUES (?,?,?,?,?,?)", [uniqid(), data.name, data.designation, data.image, data.email, data.phone ? data.phone : '-'], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

});

router.get("/", (req, res)=>{
    db.query("SELECT * FROM members", (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })
});

router.get("/:uid", (req, res)=>{
    const uid=req.params.uid;

    db.query("SELECT * FROM members WHERE uid = ? ORDER BY name", [uid], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send(results[0]);

    })

});

router.get("/by-designation/:designation", (req, res)=>{
    const designation=req.params.designation;

    db.query("SELECT * FROM members WHERE designation = ?", [designation], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success", data:results});

    })

})

module.exports=router;