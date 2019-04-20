var express=require("express");
var router=express.Router();
var db=require("../../utils/db");
let AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

const COGNITO_CLIENT = new AWS.CognitoIdentityServiceProvider({
    apiVersion: process.env.API_VERSION,
    region: process.env.REGION
});

router.post("/", (req, res)=>{
    const data=req.body;
    
    
      var poolData = {
        UserPoolId: process.env.CONGNITO_USER_POOL_ID,
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
            db.query("INSERT INTO members (uid, name, designation, image, email, phone, groups_in) VALUES (?,?,?,?,?,?,'')", [response.User.Username, data.name, data.designation, data.image, data.email, data.phone ? data.phone : '-'], (err, results, fields)=>{
                if(err){
                    res.send({code:"error", message:err.message});
                    return;
                }
        
                res.send({code:"success"});
        
            })
        }

      });

});

router.delete("/:uid",(req, res)=>{
    const uid=req.params.uid;

    db.query("SELECT email FROM members WHERE uid = ?", [uid], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        if(results.length>0){
            const email=results[0].email;
            const params={
                UserPoolId:"ap-south-1_qUHQBbEJ4",
                Username:email
            };

            COGNITO_CLIENT.adminDeleteUser(params, (err, data)=>{
                if(err){
                    console.log(err);
                    res.send({code:"error", message:err.message});
                    return;
                }

                db.query("DELETE FROM members WHERE uid = ?", [uid], (err, results, fields)=>{
                    if(err){
                        res.send({code:"error", message:err.message});
                        return;
                    }

                    res.send({code:"success"});

                })

            })
            
        }else{
            res.send({code:"error", message:"No such user exists"})
        }

    })

})

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

// group_title, group_id, count
router.get("/groups/:uid", (req, res)=>{
    // const uid = req.params.uid;
    // const requestType=req.headers["request-type"];
    // db.query("SELECT groups_in from members WHERE uid = ?",[uid], (err, results, fields)=>{
    //     if(err){
    //         res.send({code:"error", message:err.message});
    //         return;
    //     }
        
    //     const a = JSON.stringify(results).split(",")
    //     for(v in a) {
    //         console.log(a[v])
    //     }

    //    // db.query("SELECT count (*) from groups_"+group_title)

    //     if(requestType === "Android") {
    //         res.send(results);
    //     } else {
    //         res.send({code:"success", data:results});
    //     }
    // });

    const uid=req.params.uid;

    db.query("SELECT groups_in FROM members WHERE uid = ?", [uid], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        const groupsIn=results[0].groups_in.split(",");
        let promises=[];

        groupsIn.forEach(a=>{
            if(a){
                promises.push(getGroupDetails(a));
            }
        });

        Promise.all(promises).then(data=>{
            res.send(data);
        }).catch(err=>{
            res.send({code:"error", message:err.message});
        })

    })

});

router.post("/update", (req, res)=>{
    const data=req.body;

    db.query("UPDATE members SET image = ? WHERE uid = ?", [data.image, data.uid], (err, results, fields)=>{
        if(err){
            res.send({code:"error", message:err.message});
            return;
        }

        res.send({code:"success"});

    })

})

function getGroupDetails(title){
    return new Promise((resolve, reject)=>{
        let data;
        db.query("SELECT * FROM groups WHERE title = ?", [title], (err, results, fields)=>{
            if(err){
                reject(err);
                return
            }

            if(results.length>0){
                data={
                    group_title:results[0].title,
                    group_id:results[0].id
                }
    
                db.query(`SELECT COUNT(*) FROM group_${results[0].title.replace(" ", "_")}`, [], (err, results, fields)=>{
                    if(err){
                        reject(err);
                        return;
                    }
    
                    data.count=results[0]["COUNT(*)"];
                    resolve(data);
    
                })
            }else{
                reject({code:"error", message:"No such group exists"})
            }

        })
    })
}

module.exports=router;