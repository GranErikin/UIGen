export interface InputValidationError {
    variableName: string;
    value: any;
    validationErrorMessage: string;
}

export interface OPTServiceError {
    option: string;
    input: string;
    error: string;
}


export interface ExternalResourceError {
    uri: string;
    statusCode: number;
    error: string;
    message: string;
    body: string;
}


export abstract class WorkerException extends Error {
    protected constructor(message: string) {
        super(message)
    }
}

export class MissingInputException extends WorkerException {
    constructor(missingInputs: string[]) {
        super(`The following variables are required but were not found: ${missingInputs.toString()}`);
    }
}

export class ExternalResourceFailureException extends WorkerException {
    constructor(error: ExternalResourceError) {
        super(`External resource at ${error.uri} failed with:\nStatus Code:${error.statusCode}\nError:${error.error}\nMessage:${error.message}\nBody:${error.body}`);
    }
}

export class OPTServiceFailureException extends WorkerException {
    constructor(error: OPTServiceError) {
        super(`OPT Conversion service failed with option:${error.option}\n with input:${error.input}\n with message:${error.error}`);
    }
}

export class EnvironmentVariableMissingException extends WorkerException {
    constructor(name: string) {
        super(`The value for the environment variable called: ${name} is null or undefined`);
    }
}

export class IDNotFoundOnTemplateException extends WorkerException {
    constructor(template: string) {
        super(`An ID element was not found on this template; Template might be malformed\\n${template}`);
    }
}

export class MetaFieldMissingException extends WorkerException {
    constructor(fieldName: string, template: string) {
        super(`A necessary meta field element was not found at path => ${fieldName} \\nTemplate might be malformed\\n${template}`);
    }
}

export class ValidationServiceFailedException extends WorkerException {
    constructor(message = "Validation Service Buffer could not be validate, check inval function from openEHR_OPT.jar") {
        super(message);
    }

}

export function buildValidationErrorMessage(topic: string, errors: InputValidationError[]): string {
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

export class InputValidationFailedException extends WorkerException {
    constructor(topic: string, validationErrors: InputValidationError[]) {
        super(buildValidationErrorMessage(topic, validationErrors));
    }
}

