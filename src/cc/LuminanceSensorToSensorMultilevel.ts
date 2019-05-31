import {ZwaveValueId, LuminanceSensor} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class LuminanceSensorToSensorMultilevel extends ZwaveDeviceBase implements LuminanceSensor {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.luminance = zwaveDevice.getValueInteger(valueId);
    }
}

export default LuminanceSensorToSensorMultilevel;
