const opt = require("../gateways/opt");

async function opt2html({ task, taskService }) {
	//TODO: finish write optfile
	let opt = task.params.opt;

	opt.opt2html(uid, (err, html) => {
		//TODO: set response params to the task
		await taskService.complete(task);
	});
	
};

module.exports={opt2html};