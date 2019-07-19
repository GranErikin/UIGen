const router = new (require('restify-router')).Router();
const converters = require('../handlers/converters');
const utils = require('../handlers/utils');

router.use((req, res, next) => {
	let path = req.path();
	req.fileType='opt';
	if(path.includes('instance')) req.fileType='instance';
	next();
});

router.post("/opt2html/:uid", [utils.writeFile, converters.opt2html]);
router.post("/opt2contribution/:uid", [utils.writeFile, converters.opt2contribution]);
router.post("/opt2bundle/:uid", [utils.writeFile, converters.opt2bundle]);
router.post("/validate/instance/:uid", [utils.writeFile, utils.validateInstance]);
router.post("/merge/contribution", [converters.mergeContribution]);

module.exports = router;