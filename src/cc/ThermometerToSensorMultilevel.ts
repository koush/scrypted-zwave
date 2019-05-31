import {ZwaveValueId, Thermometer, TemperatureUnit} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class ThermometerToSensorMultilevel extends ZwaveDeviceBase implements Thermometer {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        var f = zwaveDevice.getValueUnit(valueId) === TemperatureUnit.F;
        if (!f) {
            zwaveDevice.temperature = zwaveDevice.getValueInteger(valueId);
            zwaveDevice.temperatureUnit = TemperatureUnit.C;
        }
        else {
            zwaveDevice.temperature = (zwaveDevice.getValueInteger(valueId) - 32) * 5 / 9;
            zwaveDevice.temperatureUnit = TemperatureUnit.F;
        }
    }
}

export default ThermometerToSensorMultilevel;
