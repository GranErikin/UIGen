/// <reference types="node" />
declare module 'camunda-external-task-client-js' {
    export class Variables {

        setTyped(variableName: string, content: object): Variables

        get(variableName: string): any

        getAll(): any

        getAllTyped(): any
    }

    interface CustomOptions {
        baseUrl: string;
        workerId?: string;
        maxTasks?: number;
        customOptions?: number;
        lockDuration?: number;
        autoPoll?: boolean;
        asyncResponseTimeout?: number;
        interceptors?: (request: any) => any | Array<(request: any) => any>;
        use?: (client: Client) => void | Array<(client: Client) => void>;
    }

    export function logger(client: Client): void;

    interface TaskWrapper {
        task: Task;
        taskService: TaskService;
    }

    interface SubscribeCustomOptions {
        lockDuration?: number;
        variables?: Variables[];
        businessKey?: string;
        processDefinitionId?: string;
        processDefinitionIdIn?: string;
        processDefinitionKey?: string;
        processDefinitionKeyIn?: string;
        processDefinitionVersionTag?: string;
        withoutTenantId?: string;
        tenantIdIn?: boolean;
    }

    export interface TopicSubscription {
        handler: (taskWrapper: TaskWrapper) => void;
        unsubscribe: () => void;
        lockDuration: number;
        customOptions?: SubscribeCustomOptions;
    }

    export class Client {

        constructor(customOptions: CustomOptions)

        start(): void

        stop(): void

        //subscribe(topic: string, handler: (taskWrapper: TaskWrapper) => void): TopicSubscription

        subscribe(topic: string, handler: (taskWrapper: TaskWrapper) => void, customOptions?: SubscribeCustomOptions): TopicSubscription
    }


    export class Task {
        variables: Variables
    }

    export class TaskService {
        complete(task: Task, processVariables: Variables, localVariables?: Variables): Promise<void>

        handleFailure(task: Task, options: any): Promise<void>
    }
}