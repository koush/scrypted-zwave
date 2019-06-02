import { Entry, ZwaveValueId } from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class EntryToGarageDoor extends ZwaveDeviceBase implements Entry {
    closeEntry(): void {
        this.setValue(EntryToGarageDoor, 'Closed');
    }
    openEntry(): void {
        this.setValue(EntryToGarageDoor, 'Opened');
    }
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        zwaveDevice.entryOpen = zwaveDevice.getValue(valueId) !== 'Closed';
    }
}

export default EntryToGarageDoor;
