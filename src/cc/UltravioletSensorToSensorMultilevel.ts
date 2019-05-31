import {ZwaveValueId, UltravioletSensor} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class UltravioletSensorMultilevel extends ZwaveDeviceBase implements UltravioletSensor {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.ultraviolet = zwaveDevice.getValueInteger(valueId);
    }
}

export default UltravioletSensorMultilevel;
