import sdk, {Brightness, OnOff, ZwaveValueId} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";
const {zwaveManager} = sdk;

export class BrightnessToSwitchMultilevel extends ZwaveDeviceBase implements OnOff, Brightness {
    turnOff(): void {
        this.setBrightnessInternal(0);
    }

    turnOn(): void {
        this.setBrightnessInternal(255);
    }

    setBrightness(brightness: number): void {
        this.setBrightnessInternal(Math.min(Math.max(brightness, 0), 99));
    }

    setBrightnessInternal(brightness: number): void {
        this.setValue(BrightnessToSwitchMultilevel, brightness.toString());

        this._polling = Date.now();
    }

    _lastBrightness: number;
    _polling: number;

    _refresh(valueId: ZwaveValueId) {
        setTimeout(() => {
            zwaveManager.refreshValue(valueId);
        }, 5000);
    }

    static onValueChanged(zwaveDevice: BrightnessToSwitchMultilevel, valueId: ZwaveValueId) {
        var brightness = zwaveDevice.getValueInteger(valueId);

        // dimmer devices may have a fade in/out. so poll the value until it settles (or 30 sec mac)
        // to watch for the on/off events. otherwise devices may get stuck in some mid-dim value.
        if (zwaveDevice._polling) {
            if (brightness === zwaveDevice._lastBrightness || Date.now() > zwaveDevice._polling + 30000) {
                zwaveDevice._polling = undefined;
            }
            else {
                zwaveDevice._refresh(valueId);
            }
            zwaveDevice._lastBrightness = brightness;
        }

        if (brightness === 99) {
            brightness = 100;
        }
        zwaveDevice.on = !!brightness;
        zwaveDevice.brightness = brightness;
    }
}

export default BrightnessToSwitchMultilevel;
