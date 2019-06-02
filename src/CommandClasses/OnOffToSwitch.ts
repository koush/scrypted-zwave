import {OnOff, ZwaveValueId} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class OnOffToSwitch extends ZwaveDeviceBase implements OnOff {
    turnOff(): void {
        this.setValue(OnOffToSwitch, 'false');
    }

    turnOn(): void {
        this.setValue(OnOffToSwitch, 'true');
    }

    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.on = zwaveDevice.getValueBoolean(valueId);
    }
}

export default OnOffToSwitch;
