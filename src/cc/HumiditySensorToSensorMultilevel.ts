import {ZwaveValueId, HumiditySensor} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class HumidityToSensorMultilevel extends ZwaveDeviceBase implements HumiditySensor {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.humidity = zwaveDevice.getValueInteger(valueId);
    }
}

export default HumidityToSensorMultilevel;
