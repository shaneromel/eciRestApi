var express=require("express");
var router=express.Router();

var admin = require("firebase-admin");

var serviceAccount = {
    "type": "service_account",
    "project_id": "election-contest",
    "private_key_id": "a6634a63c7e8ec959ae2a137de4b8340b8954c4d",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCk5XvB5lmHt/Zl\ndZHFpjqYhvDgvMbRYk/XbRxsVDuH6hm6mxi+A7BhRg46Ye7zAnpcljc6RBM0xUi3\nGpu114RQYryoT44MdOvEjxORimUUVnsP3HC2nVJ1n1aqCa28td9BOI4TdSsjyuEf\n2AFZtXXmwXpVpqf6JMzquY/bGuDWtAaa2esn6/ASljhImWpazsxM8YCKbz2kq0b7\nBAP1FhJjNFG0YDcPGpk7Blhdu24Z2OhASOB4f2W0DXydLUEPgR8tt/w006MVmCk9\nVkPNIRudZgWf0C6++kYMHOeVwvTTLoO3kcTt6vLVrtYYKCnJD55+HmafcFaZhi1o\nxqmQcJfTAgMBAAECggEAQURj27elMEbsS/RhIm5NOxoONaYCu9XB7G7PlUEx3vYW\nAPpqrKshIR9tekZRIfaVIBiE+5b+UyDTS0ZI44zOXlL2gVgbzWpp9376K90vbQFd\n7EVAh8d1YAEVeHAkSFFkcJhGBAWYca5XtRb2Ud+1LwTduxEf4661PSL9gaf93nz4\nEGYzeo23Mh2J+uG2El3GAHM17DwvcihBNaVOX+y8X1CJe+1I98Klmz52rg0ha2FM\nWuCrUfMMblTekFw+hCGyPTwFBB12+nRBlGAwm816WwxZr3T3qu2KuVEj95GVYFBz\n5gTF59cPbvXq4EqqNkPxHcpxyuyzDrdB1B2UraSlwQKBgQDd0mLOxi03AMZ/s9yx\nbXqTSaZs212Xt2DoFDqdL4mhMiz+IlI+O7KHSUsCLRS6a2GgIooQsguaQ1omm5vw\nvaLgR+ws1gQhnNMN+UDglPOBA58/HWXNCHLlee+JJ9XiBjrBt6aoiMpiGLjbYQtu\nWcOncpU6hqntUc2iSBbrIExWeQKBgQC+TbaCk7WgUemn1tKVHzA3m/kuS8RHZiDt\nbfdZ2dkPw9RvMu4lTft/ltGK4pHxYIOZyipIRMprnnrCKE4ZAredc9jQl7/h30vC\nAVAJ7Oq188Efh3E4OZ2gDyiefdHJUUvTdolKdQbBZEj6iRuaJcWOatWkDMoQHDw6\npJSn3Zg9qwKBgDZZCp5wzbkxNnEpZ0QNd7/Ihr8bDBZU9qhF9Ip4kDbvbTiivhXD\nWJ1u5rLUysRV9OhgLgWjKdaU8+yLqaxVOifLV2Ew2nhFzSwaSrv7oqGUeprjIAMZ\nM9Vnh7nKCcxEDHdUAMBAK53XQst1PnC+C4LmPwvE3LNpnIFLOlpHYoy5AoGAL8UM\nMlzns7W8JGB9fedVUDA77Y4hWBbf3xnChHB110o+EifDteOMZSuzr9xN7Dxg7ILd\n+EQkV71xbTl22TpgYwrIexwMk6NcvfdcYxFwnXnxmXuDRSzZT2tes+I7fgCFOzC/\nJ8yWhIcq9pDiN+CRZb2VoVeAhWjBCat0kWrDo38CgYBqc6uWfggFEOqLhTy1sVZs\np/as86BzB2wxjl6QTIDUeiMdwp4wwGJzqGiG7GMcHpXdMrr1YuZdI4OHF8VE81/n\nsG4RV5blGY2KZw0bxrQ13EYUoqDW9Y66gff2sfrJWHEZ/0l9Ekl+vws9HBLxAjnO\nx6Hb8Kkkn+jYrQHoX6uMeA==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-s14si@election-contest.iam.gserviceaccount.com",
    "client_id": "113509836048985625101",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-s14si%40election-contest.iam.gserviceaccount.com"
  };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://election-contest.firebaseio.com"
});

router.post("/send", (req, res)=>{
    let message;

    if(req.body.image){
        message = {
            data: {
              title: req.body.title,
              message: req.body.message,
              image:req.body.image
            },
            topic: req.body.topic
        };
    }else{
        message = {
            data: {
              title: req.body.title,
              message: req.body.message
            },
            topic: req.body.topic
        };
    }

    admin.messaging().send(message).then(()=>{
        res.send({code:"success"});
    }).catch(err=>{
        res.send({code:"error", message:err.message});
    })
})

module.exports=router;