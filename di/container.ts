import "reflect-metadata";
import {Container} from "inversify";
import {TYPES} from "./types";
import {Client, logger} from "camunda-external-task-client-js";

let container = new Container();

container.bind<Client>(TYPES.Client).to