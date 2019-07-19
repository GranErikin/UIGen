const router = new (require('restify-router')).Router();
const converters = require("../handlers/converters");
const utils = require("../handlers/utils");

router.post("/opt2html/:uid", [utils.writeOpt, converters.opt2html]);
router.post("/opt2contribution/:uid", [utils.writeOpt, converters.opt2contribution]);
router.post("/opt2bundle/:uid", [utils.writeOpt, converters.opt2bundle]);
router.post("/merge/contribution", [converters.mergeContribution]);

module.exports = router;