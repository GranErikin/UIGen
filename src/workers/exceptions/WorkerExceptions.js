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
class EnvironmentVariableMissingException extends WorkerException {
    constructor(name) {
        super(`The value for the environment variable called: ${name} is null or undefined`);
    }
}
exports.EnvironmentVariableMissingException = EnvironmentVariableMissingException;
class IDNotFoundOnTemplateException extends WorkerException {
    constructor(template) {
        super(`An ID element was not found on this template; Template might be malformed\\n${template}`);
    }
}
exports.IDNotFoundOnTemplateException = IDNotFoundOnTemplateException;
function buildValidationErrorMessage(topic, errors) {
    `Input validation failed for topic: ${topic}`;
    const message = "************************* Validation errors *************************";
    errors.forEach((error) => {
        message.concat('\n---------------------------------------------------------------------\n');
        message.concat(`Variable "${error.variableName}" failed validation with value:\n${error.value}\nbecause: ${error.validationErrorMessage}`);
        message.concat('\n---------------------------------------------------------------------\n');
    });
    message.concat("*********************************************************************");
    return message;
}
exports.buildValidationErrorMessage = buildValidationErrorMessage;
class InputValidationFailedException extends WorkerException {
    constructor(topic, validationErrors) {
        super(buildValidationErrorMessage(topic, validationErrors));
    }
}
exports.InputValidationFailedException = InputValidationFailedException;
//# sourceMappingURL=WorkerExceptions.js.map