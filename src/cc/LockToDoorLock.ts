import { ZwaveValueId, Lock, LockState} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class LockToDoorLock extends ZwaveDeviceBase implements Lock {
    lock(): void {
        this.setValue(LockToDoorLock, "true");
    }
    unlock(): void {
        this.setValue(LockToDoorLock, "false");
    }
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.lockState = zwaveDevice.getValueBoolean(valueId) ? LockState.Locked : LockState.Unlocked;
    }
}

export default LockToDoorLock;
