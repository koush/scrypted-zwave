import { ZwaveValueId, FloodSensor, IntrusionSensor } from "@scrypted/sdk";
import { Notification } from "./Notification";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

enum HomeSecurityState {
    Idle = 0,
    IntrusionLocationProvided,
    Intrusion,
    TamperingCoverRemoved,
    TamperingInvalidCode,
    GlassBreakage,
    MotionDetectedLocationProvided,
    MotionDetected,
    TamperingMoved,
    ImpactDetected
}

export class IntrusionSensorToHomeSecurity extends Notification implements IntrusionSensor {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        var state = zwaveDevice.getValueListValue(valueId);
        if (state === undefined) {
            return;
        }

        if (!zwaveDevice.device.interfaces.includes('IntrusionSensor')) {
            return;
        }

        zwaveDevice.intrusionDetected = state != HomeSecurityState.Idle;
    }
}
