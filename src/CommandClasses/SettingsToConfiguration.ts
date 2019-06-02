import sdk, { ZwaveValueId, Settings} from "@scrypted/sdk";
import { ZwaveDeviceBase, ZwaveFunction } from "./ZwaveDeviceBase";
import { CommandClass } from "../Types";
const {zwaveManager} = sdk;

export class SettingsToConfiguration extends ZwaveDeviceBase implements Settings {
    getBoolean(key: string): boolean {
        var val = this._get(key);
        var ret = val;
        if (ret != null) {
            ret = ret.toLowerCase();
        }
        if (ret === 'true') {
            return true;
        }
        if (ret === 'false') {
            return false;
        }
        if (!ret) {
            return null;
        }
        throw new Error(`Unable to parse boolean ${val}`);
    }
    getValidValues(key: string): string[] {
        return zwaveManager.getValueListItems(this._getValueIdOrThrow(key));
    }
    getDouble(key: string): number {
        return this.getFloat(key);
    }
    getFloat(key: string): number {
        var val = this._get(key);
        if (val === null) {
            return null;
        }
        return parseFloat(val);
    }
    getInt(key: string): number {
        var val = this._get(key);
        if (val === null) {
            return null;
        }
        return parseInt(val);
    }
    getKeyDescription(key: string): string {
        return zwaveManager.getValueHelp(this._getValueId(key));
    }
    getKeys(): string[] {
        var keys: string[] = [];

        var commandClass: CommandClass = this.instance.commandClasses[(SettingsToConfiguration as ZwaveFunction).valueId.commandClass];
        if (!commandClass) {
            throw new Error(`Configuration Command Class not found.`);
        }
        var values: ZwaveValueId[] = Object.values(commandClass.valueIds);
        for (var valueId of values) {
            keys.push(zwaveManager.getValueLabel(valueId));
        }
        return keys;
    }
    getString(key: string): string {
        return this._get(key);
    }
    _get(key: string): string {
        return zwaveManager.getValue(this._getValueIdOrThrow(key));
    }
    putBoolean(key: string, value: boolean): void {
        this._put(key, value);
    }
    putDouble(key: string, value: number): void {
        this._put(key, value);
    }
    putFloat(key: string, value: number): void {
        this._put(key, value);
    }
    putInt(key: string, value: number): void {
        this._put(key, value);
    }
    putString(key: string, value: string): void {
        this._put(key, value);
    }
    _put(key: string, value: Object) {
        zwaveManager.setValue(this._getValueIdOrThrow(key), value ? value.toString() : null);
    }

    _getValueIdOrThrow(key: string): ZwaveValueId {
        var valueId = this._getValueId(key);
        if (!valueId) {
            throw new Error(`ZwaveValueId not found: ${key}`);
        }
        return valueId;
    }

    _getValueId(key: string): ZwaveValueId {
        var commandClass: CommandClass = this.instance.commandClasses[(SettingsToConfiguration as ZwaveFunction).valueId.commandClass];
        if (!commandClass) {
            return null;
        }
        var values: ZwaveValueId[] = Object.values(commandClass.valueIds);
        for (var valueId of values) {
            if (zwaveManager.getValueLabel(valueId) === key) {
                return valueId;
            }
        }
        return null;
    }

    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.on = zwaveDevice.getValueBoolean(valueId);
    }
}

export default SettingsToConfiguration;
