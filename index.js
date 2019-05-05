require("dotenv").config();
var app=require("express")();
var bodyParser=require("body-parser");
var cors=require("cors");
var fs=require("fs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors());

app.use("/api", require("./api/index"));

app.get("/", (req, res)=>{
    res.send("Election REST")
});

app.listen(3000);