var express=require("express");
var router=express.Router();
var jwt=require("jsonwebtoken");

router.use("/auth", require("./auth"));
router.use("/polling-stations", require("./polling_stations"));
router.use("/news", require("./news"));
router.use("/events", require("./events"));
router.use("/announcements", require("./announcements"));
router.use("/contacts", require("./contacts"));
router.use("/candidates", require("./candidates"));
router.use("/notifications", require("./notifications"));
router.use("/password", require("./password"));
router.use("/feedbacks", require("./feedbacks"));
router.use("/voters", require("./voters"));
router.use("/rohof" , require("./ro_hof"))

router.post("/refresh-token", (req, res)=>{
    res.send({token:req.body.token});
})

module.exports=router;