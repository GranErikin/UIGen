import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {FS, _DOMParser, XPath, EXEC, UUID} from "../di/ThirdPartyTypes";
import {SelectedValue} from "xpath";
import {IDNotFoundOnTemplateException, ValidationServiceFailedException} from "../workers/exceptions/WorkerExceptions";
import {ContributionMerger} from "./ContributionMerger";

@injectable()
export class OPTService {
    private readonly fileSystem: FS;
    private contributionMerger: ContributionMerger;
    private readonly domParser: _DOMParser;
    private readonly xPath: XPath;
    private readonly exec: EXEC;
    private readonly uuidGenerator: UUID;

    constructor(
        @inject(TYPES.FS)fileSystem: FS,
        @inject(TYPES.DOMParser)domParser: _DOMParser,
        @inject(TYPES.Xpath)xPath: XPath,
        @inject(TYPES.EXEC)exec: EXEC,
        @inject(TYPES.UUID)uuidGenerator: UUID,
        @inject(TYPES.ContributionMerger)contributionMerger: ContributionMerger
    ) {
        this.contributionMerger = contributionMerger;
        this.fileSystem = fileSystem;
        this.domParser = domParser;
        this.xPath = xPath;
        this.exec = exec;
        this.uuidGenerator = uuidGenerator
    }

    private writeTmpFile(content: string, uuid: string, type: string): void {
        this.fileSystem.writeFileSync(`tmp/${uuid}.${type}`, content);
    }

    private deleteTmpFile(uuid: string, type: string): void {
        this.fileSystem.unlink(`tmp/${uuid}.${type}`, () => {

        });
    }

    getTemplateID(template: string) {
        const namespaces = {
            "template": "http://schemas.openehr.org/v1",
            "xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsd": "http://www.w3.org/2001/XMLSchema"
        };

        let xmlDoc = this.domParser.parseFromString(template);
        let select = this.xPath.useNamespaces(namespaces);

        let templateIdSelect: SelectedValue = select("//template:template_id/template:value", xmlDoc, true);
        let templateIdNode = templateIdSelect as Node;
        if (!templateIdNode.firstChild) {
            throw new IDNotFoundOnTemplateException(template);
        }
        return templateIdNode.firstChild.textContent
    }

    opt2html(template: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                let uuid = this.uuidGenerator.v4();
                this.writeTmpFile(template, uuid, "opt");
                this.exec(`java -cp \"./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar\" com.cabolabs.openehr.opt.Main uigen ${uuid}`);
                let htmlBuffer: Buffer = this.fileSystem.readFileSync(`tmp/${uuid}.html`);
                this.deleteTmpFile(uuid, "html");
                this.deleteTmpFile(uuid, "opt");
                resolve(htmlBuffer.toString());
            } catch (error) {
                reject(error)
            }
        })
    }

    opt2Contribution(template: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                let uuid = this.uuidGenerator.v4();
                this.writeTmpFile(template, uuid, "opt");
                this.exec(`java -cp \"./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar\" com.cabolabs.openehr.opt.Main ingen ${uuid}  1 tagged`);
                let contributionBuffer: Buffer = this.fileSystem.readFileSync(`tmp/${uuid}.contribution`);
                this.deleteTmpFile(uuid, "contribution");
                this.deleteTmpFile(uuid, "opt");
                resolve(contributionBuffer.toString());
            } catch (error) {
                reject(error)
            }
        })
    }

    async opt2bundle(template: string): Promise<{ html: string, contribution: string }> {
        return {html: await this.opt2html(template), contribution: await this.opt2Contribution(template)}
    }

    mergeContribution(answers: any, contribution: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                this.contributionMerger.mergeContribution(answers, contribution, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    validateInstance(instance: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                let uuid = this.uuidGenerator.v4();
                this.writeTmpFile(instance, uuid, "instance");
                let validationBuffer = this.exec(`java -cp \"./lib/*:$GROOVY_HOME/lib/*:lib/openEHR_OPT.jar\" com.cabolabs.openehr.opt.Main inval ${uuid}`);
                let isValid = OPTService.checkValidationBuffer(validationBuffer.toString());
                this.deleteTmpFile(uuid, "instance");
                resolve(isValid);
            } catch (error) {
                reject(error)
            }
        })
    }

    private static checkValidationBuffer(validation: string): boolean {
        let results = validation.split('\n');
        results.pop();

        let element = results.shift();
        if (!element) {
            throw new ValidationServiceFailedException();
        }

        return !element.includes('NOT VALID');
    }
}