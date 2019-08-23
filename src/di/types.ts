export const TYPES = {
    //Third-party types
    String: Symbol.for("string"),
    Number: Symbol.for("number"),
    Request: Symbol.for("Request"),
    NodeCache: Symbol.for("NodeCache"),
    DOMParser: Symbol.for("DOMParser"),
    XMLSerializer: Symbol.for("XMLSerializer"),
    Xpath: Symbol.for("XPath"),
    Logger: Symbol.for("Logger"),
    CamundaClient: Symbol.for("CamundaClient"),
    CamundaLogger: Symbol.for("CamundaLogger"),
    Variables: Symbol.for("Variables"),
    Task: Symbol.for("Task"),
    TaskService: Symbol.for("TaskService"),
    IsUUID: Symbol.for("IsUUID"),
    UUID: Symbol.for("UUID"),
    FS: Symbol.for("fs"),
    EXEC: Symbol.for("exec"),
    //Application types
    Worker: Symbol.for("Worker"),
    WorkerClient: Symbol.for("WorkerClient"),
    EHRLoginWorker: Symbol.for("EHRLoginWorker"),
    FetchTemplateWorker: Symbol.for("FetchTemplateWorker"),
    OPT2HTMLWorker: Symbol.for("OPT2HTMLWorker"),
    GatewayFactory: Symbol.for("GatewayFactory"),
    OPTService: Symbol.for("OPTService")
};