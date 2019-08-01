async function debug({ task, taskService }) {

	console.log('VARIABLES');
	console.log(task.variables.getAll());
	
	await taskService.complete(task);
}

module.exports={debug};