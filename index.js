require("dotenv").config();
var app=require("express")();
var bodyParser=require("body-parser");
var cors=require("cors");

app.use(bodyParser.json());
app.use(cors());

app.use("/api", require("./api/index"))

app.listen(3000);