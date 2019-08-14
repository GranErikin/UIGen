export interface InputValidationError {
    variableName: string;
    value: any;
    validationErrorMessage: string;
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

export class InputValidationFailedException extends WorkerException {
    constructor(topic: string, validationErrors: InputValidationError[]) {
        super(buildValidationErrorMessage(topic, validationErrors));
    }
}

export function buildValidationErrorMessage(topic: string, errors: InputValidationError[]): string {
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