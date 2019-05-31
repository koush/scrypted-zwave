import { ScryptedDeviceBase, ZwaveValueId, Device, Refresh } from "../../../scrypted-deploy";
import sdk from "@scrypted/sdk";
const {zwaveManager} = sdk;
import {Node, getInstanceHash, Instance} from "../Types";
import { CommandClassInfo, getCommandClassIndex } from ".";
import { ZwaveController, NodeLiveness } from "../main";

export class ZwaveFunction extends Function {
    valueId?: ZwaveValueId;
    property?: string;

    onValueChanged?(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
    }
}

export class ZwaveDeviceBase extends ScryptedDeviceBase implements Refresh {
    instance: Instance;
    device: Device;
    commandClasses: CommandClassInfo[] = [];
    zwaveController: ZwaveController;

    constructor(instance: Instance) {
        super(getInstanceHash(instance.node.home.id, instance.node.id, instance.id));
        this.instance = instance;
    }

    setValue(clazz: ZwaveFunction, value: string) {
        var valueId: ZwaveValueId = {};
        Object.assign(valueId, clazz.valueId);
        valueId.homeId = this.instance.node.home.id;
        valueId.nodeId = this.instance.node.id;
        valueId.instance = this.instance.id;
        zwaveManager.setValue(valueId, value);
    }

    getValue(valueId: ZwaveValueId): string {
        return zwaveManager.getValue(valueId);
    }

    onValueChanged(valueId: ZwaveValueId) {
        var cc = getCommandClassIndex(valueId.commandClass, valueId.index);
        if (!cc) {
            return;
        }
        cc.clazz.onValueChanged(this, valueId);
    }

    getValueBoolean(valueId: ZwaveValueId): boolean {
        var val = this.getValue(valueId);
        return val ? val.toLowerCase() === 'true' : false;
    }

    getValueInteger(valueId: ZwaveValueId): number {
        var val = this.getValue(valueId);
        try {
            return parseInt(val);
        }
        catch (e) {
            return null;
        }
    }

    getValueUnit(valueId: ZwaveValueId): string {
        return zwaveManager.getValueUnit(valueId);
    }

    getRefreshFrequency(): number {
        return 30;
    }

    refresh(refreshInterface: string, userInitiated: boolean): void {
        // if it's not user initiated, ignore it. this is too expensive.
        if (!userInitiated) {
            return;
        }

        this.zwaveController.updateNodeLiveness(this, NodeLiveness.Query);

        for (var commandClass of this.commandClasses) {
            if (refreshInterface != null && !commandClass.interfaces.includes(refreshInterface)) {
                continue;
            }

            var valueId: ZwaveValueId = {};
            valueId = Object.assign(valueId, commandClass.clazz.valueId);
            valueId.homeId = this.instance.node.home.id;
            valueId.nodeId = this.instance.node.id;
            valueId.instance = this.instance.id;
            zwaveManager.refreshValue(valueId);
        }
    }
}
