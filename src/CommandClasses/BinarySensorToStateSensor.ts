import {ZwaveValueId, BinarySensor} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class BinarySensorToStateSensor extends ZwaveDeviceBase implements BinarySensor {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.binaryState = zwaveDevice.getValueBoolean(valueId);
    }
}

export default BinarySensorToStateSensor;
