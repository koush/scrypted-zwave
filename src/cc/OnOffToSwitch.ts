import {OnOff, ZwaveValueId} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class Switch extends ZwaveDeviceBase implements OnOff {
    turnOff(): void {
        this.setValue(Switch, 'false');
    }

    turnOn(): void {
        this.setValue(Switch, 'true');
    }

    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.on = zwaveDevice.getValueBoolean(valueId);
    }
}

export default Switch;
