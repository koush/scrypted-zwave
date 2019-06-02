import { EntrySensor, ZwaveValueId } from "@scrypted/sdk";
import EnsureMap from "./EnsureMap";

export class CommandClass {
    constructor(instance: Instance, id: number) {
        this.instance = instance;
        this.id = id;
    }
    instance: Instance;
    id: number;
    valueIds: ZwaveValueIdMap = {};
}

export class Instance extends EnsureMap<CommandClass, CommandClassMap> {
    node: Node;
    id: number;

    commandClasses: CommandClassMap;

    constructor(node: Node, id: number) {
        super({});
        this.commandClasses = this._map;
        this.node = node;
        this.id = id;
    }

    create(key): CommandClass {
        return new CommandClass(this, key);
    }
}

export class Node extends EnsureMap<Instance, InstanceMap> {
    home: Home;
    id: number;
    instances: InstanceMap;

    constructor(home: Home, id: number) {
        super({});
        this.instances = this._map;
        this.home = home;
        this.id = id;
    }

    create(key): Instance {
        return new Instance(this, key);
    }
}

export interface ZwaveValueIdMap { [s: number]: ZwaveValueId; }
export interface InstanceMap { [s: number]: Instance; }
export interface CommandClassMap { [s: number]: CommandClass; }
export interface NodeMap { [s: number]: Node; }

export class Home extends EnsureMap<Node, NodeMap> {
    nodes: NodeMap;
    id: number;

    constructor(id: number) {
        super({});
        this.nodes = this._map;
        this.id = id;
    }

    create(key): Node {
        return new Node(this, key);
    }
}

export interface HomeMap { [s: number]: Home; }

export class Homes extends EnsureMap<Home, HomeMap> {
    homes: HomeMap;

    constructor() {
        super({});
        this.homes = this._map;
    }

    create(key): Home {
        return new Home(key);
    }
}

export function getInstanceHash(homeId: number, nodeId: number, instance: number): string {
    return `${homeId}#${nodeId}#${instance}`;
}

export function getNodeHash(node: Node): string {
    return `${node.home.id}#${node.id}`;
}
