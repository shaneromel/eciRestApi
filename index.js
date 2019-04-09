var app=require("express")();
var bodyParser=require("body-parser");
var cors=require("cors");
var jwt=require("jsonwebtoken");
var fs=require("fs");

app.use(bodyParser.json());
app.use(cors());

app.use("/api", require("./api/index"))

app.listen(3000);