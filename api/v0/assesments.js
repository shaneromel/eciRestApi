var express=require("express");
var router=express.Router();
var db=require("../../utils/db");

//group_title assesment_name enable
router.post("/", (req,res)=>{
    const data = req.body;
    let query;
    query = "CREATE TABLE assesment_"+data.assesment_name+" (id int not null auto_increment, question varchar(100) not null, opt1 varhcar(50) not null, opt2 varchar(50) not null, opt3 varchar(50)not null, opt4 varchar(50) not null, correct_opt int not null, primary key(id))";
    db.query(query, [], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        res.send({code: "success"})
    }) 
});

module.exports = router;