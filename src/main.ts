// https://developer.scrypted.app/#getting-started
import sdk, { DeviceProvider, EventDetails, ScryptedDevice, ZwaveNotification, ZwaveNotificationType, ZwaveValueId } from "@scrypted/sdk";
import { getCommandClassIndex, CommandClassInfo, getCommandClass } from "./CommandClasses";
import { ZwaveDeviceBase } from "./CommandClasses/ZwaveDeviceBase";
import { CommandClass, getInstanceHash, Home, Homes, Node, NodeMap, getNodeHash, Instance } from "./Types";
const { log, zwaveManager, deviceManager } = sdk;
import debounce from "lodash.debounce";

export enum NodeLiveness {
    Live,
    Query,
    Dead,

    // internal state
    QueryLive,
    QueryDead,
}

class NodeLivenessInfo {
    liveness: NodeLiveness;
    time: number = Date.now();
    checker: Function;

    updateLiveness(liveness: NodeLiveness): boolean {
        this.time = Date.now();
        if (this.liveness == liveness)
            return false;
        this.liveness = liveness;
        return true;
    }
}

export class ZwaveController implements DeviceProvider {
    homes: Homes = new Homes();
    devices: Object = {};
    nodeLiveness: Object = {};

    discoverDevices(duration: number): void {
        throw new Error("Method not implemented.");
    }
    
    getDevice(nativeId: string): object {
        return this.devices[nativeId];
    }

    parseNotification(notification: ZwaveNotification, dirty: NodeMap) {
        var valueId: ZwaveValueId = notification.valueId;
        var dirtyKey = getInstanceHash(valueId.homeId, valueId.nodeId, valueId.instance);

        if (valueId.homeId === 0) {
            return;
        }

        switch (notification.type) {
            case ZwaveNotificationType.Type_ValueAdded:
                var instance: Instance = this.homes
                .getOrCreate(valueId.homeId)
                .getOrCreate(valueId.nodeId)
                .getOrCreate(valueId.instance);

                instance
                .getOrCreate(valueId.commandClass).valueIds[valueId.index] = valueId;

                dirty[dirtyKey] = instance;
                break;
            case ZwaveNotificationType.Type_ValueRemoved:
                var instance: Instance = this.homes
                .getOrCreate(valueId.homeId)
                .getOrCreate(valueId.nodeId)
                .getOrCreate(valueId.instance);

                instance
                .getOrCreate(valueId.commandClass).valueIds[valueId.index];

                dirty[dirtyKey] = instance;
                break;
            case ZwaveNotificationType.Type_NodeRemoved:
                var home: Home = this.homes.getOrCreate(valueId.homeId);
                delete home.nodes[valueId.nodeId];
                break;
            case ZwaveNotificationType.Type_ValueChanged:
                var device: ZwaveDeviceBase = this.devices[dirtyKey];
                if (!device) {
                    return;
                }
                this.updateNodeLiveness(device, NodeLiveness.Live);

                device.onValueChanged(valueId);
                break;
        }
    }

    onNotification(eventSource: ScryptedDevice, eventDetails: EventDetails, eventData: ZwaveNotification[]) {
        var dirty = {};

        for (var notification of eventData) {
            this.parseNotification(notification, dirty);
        }
        
        var instances: Instance[] = Object.values(dirty);
        for (var nativeId in instances) {
            var instance: Instance = instances[nativeId];
            this.rebuildInstance(instance);
        }
    }

    _addType(updatedDevices, instance: Instance, type: CommandClassInfo, valueId: ZwaveValueId) {
        var interfaces = type.getInterfaces(valueId);
        if (!interfaces) {
            return;
        }

        var methods = Reflect.ownKeys(type.clazz.prototype).filter(v => v != 'constructor');

        var instanceHash: string = getInstanceHash(instance.node.home.id, instance.node.id, instance.id);
        var scryptedDevice: ZwaveDeviceBase = updatedDevices[instanceHash];
        if (!scryptedDevice) {
            scryptedDevice = updatedDevices[instanceHash] = this.devices[instanceHash] = new ZwaveDeviceBase(instance);
            scryptedDevice.zwaveController = this;
            scryptedDevice.device = {
                name: zwaveManager.getNodeName(instance.node.home.id, instance.node.id),
                interfaces: [],
                nativeId: instanceHash,
            };
        }

        for (var m of methods) {
            scryptedDevice[m] = type.clazz.prototype[m];
        }

        scryptedDevice.device.interfaces.push(...interfaces);
        scryptedDevice.commandClasses.push(type);
    }

    rebuildInstance(instance: Instance) {
        var updatedDevices = {};

        for (let commandClassId in instance.commandClasses) {
            let cc: CommandClass = instance.commandClasses[commandClassId];
            let values: ZwaveValueId[] = Object.values(cc.valueIds);

            var type = getCommandClass(cc.id);
            if (type) {
                this._addType(updatedDevices, instance, type, null);
                continue;
            }

            for (var value of values) {
                var type = getCommandClassIndex(value.commandClass, value.index);
                if (!type) {
                    continue;
                }

                this._addType(updatedDevices, instance, type, value);
            }
        }

        for (var nativeId in updatedDevices) {
            var scryptedDevice: ZwaveDeviceBase = updatedDevices[nativeId];
            if (!scryptedDevice.device.interfaces.length) {
                return;
            }
            scryptedDevice.device.interfaces.push('Refresh', 'Online');
            deviceManager.onDeviceDiscovered(scryptedDevice.device);
        }
    }

    updateNodeLiveness(device: ZwaveDeviceBase, liveness: NodeLiveness) {
        var key = getNodeHash(device.instance.node);
        var current: NodeLivenessInfo = this.nodeLiveness[key];

        if (!current) {
            current = new NodeLivenessInfo();
            current.liveness = liveness;
            this.nodeLiveness[key] = current;
            device.online = this.isNodeOnline(device.instance.node);
            return;
        }

        if (liveness == NodeLiveness.Live || liveness == NodeLiveness.Dead) {
            if (current.updateLiveness(liveness)) {
                device.online = this.isNodeOnline(device.instance.node);
            }
            return;
        }

        // if the existing liveness is too old, this node's liveness status gets downgraded
        if (current.time < Date.now() - 60000) {
            if (current.liveness == null)
                current.liveness = NodeLiveness.Live;
            switch (current.liveness) {
                case NodeLiveness.Live:
                case NodeLiveness.Query:
                    liveness = NodeLiveness.QueryLive;
                    break;
                case NodeLiveness.QueryLive:
                    liveness = NodeLiveness.QueryDead;
                    break;
                case NodeLiveness.QueryDead:
                    liveness = NodeLiveness.Dead;
                    break;
                default:
                    liveness = NodeLiveness.Dead;
            }
            device.log.w("Node has been downgraded: " + liveness);
            if (current.updateLiveness(liveness))
                device.online = this.isNodeOnline(device.instance.node);
        }
        else if (current.liveness == NodeLiveness.Live) {
            device.log.i("Node was recently online. Stopping healthcheck until a later query.");
            return;
        }

        // dead is dead. wait for it to come back. no more health checking.
        if (liveness == NodeLiveness.Dead) {
            device.log.e("Node is not online. Stopping health checks until it returns.");
            return;
        }

        // check the health again in a bit.
        if (!current.checker) {
            current.checker = debounce(() => {
                this.updateNodeLiveness(device, NodeLiveness.Query);
            }, 30000);
        }
        current.checker();
    }

    isNodeOnline(node: Node): boolean {
        var info: NodeLivenessInfo = this.nodeLiveness[getNodeHash(node)];
        if (info == null || info.liveness == null || info.liveness == NodeLiveness.Live || info.liveness == NodeLiveness.QueryLive || info.liveness == NodeLiveness.Query)
            return true;

        return false;
    }
}

const zwaveController: ZwaveController = new ZwaveController();

// TODO: json coerced javascript objects seem to be coming down the pipe with __java_this properties??
// maybe beacuse the JavaScriptObject sent up to Java needs this?
// should this be cleaned up to mark it as oneway, and the parsing is in C?
const interfaces = zwaveManager.interfaces;

// deviceManager.onDevicesChanged({
//     devices: []
// })

zwaveManager.listen("ZwaveManager", zwaveController.onNotification.bind(zwaveController));

export default zwaveController;
