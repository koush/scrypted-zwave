import {ZwaveValueId, BinarySensor} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class OnOffToSwitch extends ZwaveDeviceBase implements BinarySensor {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.binaryState = zwaveDevice.getValueBoolean(valueId);
    }
}

export default OnOffToSwitch;
