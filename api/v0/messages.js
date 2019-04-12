var express=require("express");
var router=express.Router();
var db=require("../../utils/db");


//message group_title
router.post("/", (req, res)=>{
    const data=req.body;

    db.query("INSERT INTO messages (group_title, message, timestamp) VALUES (?,?,?)", [data.group_title, data.message, Date.now()], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        res.send({code:"success"});

    })

});

router.get("/:group_title", (req,res)=>{
    const group_title = req.params.group_title;
    db.query("SELECT * FROM messages WHERE group_title = ? ORDER BY timestamp DESC;", [group_title], (err, results, fields)=>{
        if(err){
            res.send({code: "error", message:err.message});
            return;
        }
        res.send({code:"success", data: results})
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
        }
        res.send({code: "success"})
    })
});

module.exports=router;