import {ZwaveValueId, Battery} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class BatteryToBattery extends ZwaveDeviceBase implements Battery {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.batteryLevel = zwaveDevice.getValueInteger(valueId);
    }
}

export default BatteryToBattery;
