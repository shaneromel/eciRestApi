var mysql=require("mysql");
var connection=mysql.createConnection({
    host:"electionapprds.ctvkg05ew1s4.us-east-2.rds.amazonaws.com",
    user:"sorenadmin",
    password:"appdb2019",
    database:"electionapprds_db"
});

connection.connect(err=>{
    if(err){
        console.log(err);
        return;
    }

    console.log("connected to mysql db");

});

module.exports=connection;