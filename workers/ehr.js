const ehr = require("../gateways/ehr");
const {Variables} = require("camunda-external-task-client-js");

async function ehrLogin({task, taskService}) {
    ehr.getEHRServerToken(async (err, response) => {

        const processVariables = new Variables();
        processVariables.setTyped("token", {
            value: response.token,
            type: "String",
        });

        await Worker.complete(task, processVariables);
    });
}

async function fetchOPTTemplate({task, taskService}) {

    const token = task.variables.get("token");
    const templateId = task.variables.get("templateId");

    ehr.fetchOPTTemplate(token, templateId, async (err, template) => {
        const processVariables = new Variables();
        processVariables.setTyped("template", {
            value: template,
            type: "Xml",
            valueInfo: {
                transient: true
            }
        });
        await Worker.complete(task, processVariables);
    });
}

module.exports = {ehrLogin};