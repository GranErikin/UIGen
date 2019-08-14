"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WorkerException extends Error {
    constructor(message) {
        super(message);
    }
}
exports.WorkerException = WorkerException;
class MissingInputException extends WorkerException {
    constructor(missingInputs) {
        super(`The following variables are required but were not found: ${missingInputs.toString()}`);
    }
}
exports.MissingInputException = MissingInputException;
class ExternalResourceFailureException extends WorkerException {
    constructor(error) {
        super(`External resource at ${error.uri} failed with:\nStatus Code:${error.statusCode}\nError:${error.error}\nMessage:${error.message}\nBody:${error.body}`);
    }
}
exports.ExternalResourceFailureException = ExternalResourceFailureException;
class InputValidationFailedException extends WorkerException {
    constructor(topic, validationErrors) {
        super(buildValidationErrorMessage(topic, validationErrors));
    }
}
exports.InputValidationFailedException = InputValidationFailedException;
function buildValidationErrorMessage(topic, errors) {
    `Input validation failed for topic: ${this.topic}`;
    let message = "************************* Validation errors *************************";
    errors.forEach((error) => {
        message.concat('\n---------------------------------------------------------------------\n');
        message.concat(`Variable "${error.variableName}" failed validation with value:\n${error.value}\nbecause: ${error.validationErrorMessage}`);
        message.concat('\n---------------------------------------------------------------------\n');
    });
    message.concat("*********************************************************************");
    return message;
}
exports.buildValidationErrorMessage = buildValidationErrorMessage;
//# sourceMappingURL=WorkerExceptions.js.map