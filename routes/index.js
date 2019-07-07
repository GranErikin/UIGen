const router = new (require('restify-router')).Router();
const converters = require("../handlers/converters");
const utils = require("../handlers/utils");

router.use(utils.writeOpt);
router.post("/opt2html/:uid", [converters.opt2html]);
router.post("/opt2contribution/:uid", [converters.opt2contribution]);
router.post("/opt2bundle/:uid", [converters.opt2bundle]);

module.exports = router;