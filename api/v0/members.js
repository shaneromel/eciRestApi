var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
var uniqid=require("uniqid");
let AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: "AKIAQ4X7IP6B6755ETPK",
    secretAccessKey: "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",
    region: "ap-south-1"
});

router.post("/", (req, res)=>{
    const data=req.body;

    const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({
        apiVersion: "2016-04-19",
        region: "ap-south-1"
      });
    
    
      var poolData = {
        UserPoolId: "ap-south-1_qUHQBbEJ4",
        Username: data.email,
        DesiredDeliveryMediums: ["EMAIL"],
        TemporaryPassword: "Abc@123456",
        UserAttributes: [
          {
            Name: "email",
            Value: data.email
          },
          {
            Name: "name",
            Value: data.name
          },
          {
            Name: "email_verified",
            Value: "true"
          }
        ]
      };
      COGNITO_CLIENT.adminCreateUser(poolData, (error, response) => {
        
        if(error){
            res.send({code:"error", message:error.message})
        }else{
            db.query("INSERT INTO members (uid, name, designation, image, email, phone, groups_in) VALUES (?,?,?,?,?,?,'')", [uniqid(), data.name, data.designation, data.image, data.email, data.phone ? data.phone : '-'], (err, results, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }
        
                res.send({code:"success"});
        
            })
        }

      });

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


router.get("/groups/:uid", (req, res)=>{
    const uid = req.params.uid;
    db.query("SELECT * from members WHERE uid = ?",[uid], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }
        res.send({code:"success", data: results});
    })    
})

module.exports=router;