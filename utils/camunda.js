function handleFailure(taskService, task, err, retries, retriesTimeout) {
	taskService.handleFailure(task, {
		errorMessage: err.message,
		errorDetails: err.stack,
		retries,
		retryTimeout
	});	
}

module.exports={handleFailure};