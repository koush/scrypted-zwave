import sdk, { ZwaveValueId, Settings, Setting} from "@scrypted/sdk";
import { ZwaveDeviceBase, ZwaveFunction } from "./ZwaveDeviceBase";
import { CommandClass } from "../Types";
const {zwaveManager} = sdk;

export class SettingsToConfiguration extends ZwaveDeviceBase implements Settings {
    getSettings(): Setting[] {
        var settings: Setting[] = [];
        var commandClass: CommandClass = this.instance.commandClasses[(SettingsToConfiguration as ZwaveFunction).valueId.commandClass];
        if (!commandClass) {
            throw new Error(`Configuration Command Class not found.`);
        }
        var values: ZwaveValueId[] = Object.values(commandClass.valueIds);
        for (var valueId of values) {
            let setting: Setting = {};
            setting.key = valueId.index.toString();
            setting.title = zwaveManager.getValueLabel(valueId);
            setting.description = zwaveManager.getValueHelp(valueId);
            setting.choices = zwaveManager.getValueListItems(valueId);
            setting.value = this.getSetting(setting.key);
            settings.push(setting);
        }
        return settings;
    }
    getSetting(key: string): string {
        return zwaveManager.getValue(this._getValueIdOrThrow(key));
    }
    putSetting(key: string, value: Object) {
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
        return commandClass.valueIds[parseInt(key)];
    }

    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.on = zwaveDevice.getValueBoolean(valueId);
    }
}

export default SettingsToConfiguration;
