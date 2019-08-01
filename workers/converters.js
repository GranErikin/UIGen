const opt = require("../gateways/opt");
const async = require("async");
const fileUtils = require("../utils/file");
const camundaUtils = require("../utils/camunda");
const { Variables } = require("camunda-external-task-client-js");


async function opt2html({ task, taskService }) {
	let content = task.variables.get("opt");
	let path = fileUtils.writeTmpFileSync(content);
	opt.opt2html(path, (err, html) => {
		if (err) return camundaUtils.handleFailure(taskService, task, err, 1, 1000);		
		let variables = new Variables();
		variables.setTyped("html", {
			value: html,
			type: "html",
			valueInfo: {}
		});
		taskService.complete(task, variables);
	});
}

async function opt2Contribution({ task, taskService }) {
	let content = task.variables.get("opt");
	let path = fileUtils.writeTmpFileSync(content);
	opt.opt2Contribution(path, (err, contribution) => {
		if (err) return camundaUtils.handleFailure(taskService, task, err, 1, 1000);		
		let variables = new Variables();
		variables.setTyped("contribution", {
			value: contribution,
			type: "xml",
			valueInfo: {}
		});
		taskService.complete(task, variables);
	});
}

async function opt2Bundle({ task, taskService }) {
	let content = task.variables.get("opt");
	let path = fileUtils.writeTmpFileSync(content);

	async.parallel({
        html: (cb) => {
            opt.opt2html(path, cb);
        },
        contribution: (cb) => {
            opt.opt2contribution(path, cb);
        }
    }, (err, data) => {
		if (err) return camundaUtils.handleFailure(taskService, task, err, 1, 1000);		
		let variables = new Variables();
		variables.setTyped("html", {
			value: data.html,
			type: "html",
			valueInfo: {}
		});
		variables.setTyped("contribution", {
			value: data.contribution,
			type: "xml",
			valueInfo: {}
		});
		taskService.complete(task, variables); 
    });
}

module.exports = { opt2html, opt2Contribution, opt2Bundle};
