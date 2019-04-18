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
router.use("/votersfeed", require("./votersfeed"));
router.use("/members", require("./members"));
router.use("/groups", require("./groups"));
router.use("/designations", require("./designations"));
router.use("/messages", require("./messages"));
router.use("/assesments", require("./assesments"));
router.use("/discussions", require("./discussions"));
router.use("/admins", require("./admins"));
router.use("/support", require("./support"));

router.post("/refresh-token", (req, res)=>{
    res.send({token:req.body.token});
})

module.exports=router;