import sdk, { ZwaveValueId } from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";
const {zwaveManager} = sdk;

export enum NotificationType
{
    WaterAlarm = 5,
    AccessControl = 6,
    HomeSecurity = 7,
    PowerManagement = 8,
}

export class Notification extends ZwaveDeviceBase {
    static checkInterface(valueId: ZwaveValueId, ...enums: number[]): boolean {
        var values = zwaveManager.getValueListValues(valueId);
        if (!values) {
            return false;
        }
        for (var e of enums) {
            if (!values.includes(e)) {
                return false;
            }
        }
        return true;
    }
}
