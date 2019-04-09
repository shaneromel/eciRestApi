var express=require("express");
var router=express.Router();

router.use(require("../middleware/auth"));
router.use("/v0", require("./v0/index"));

module.exports=router;