import { ZwaveValueId, FloodSensor } from "@scrypted/sdk";
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

export class FloodSensorToWaterAlarm extends Notification implements FloodSensor {
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        var state = zwaveDevice.getValueListValue(valueId);
        if (state === undefined) {
            return;
        }

        zwaveDevice.intrusionDetected = state != HomeSecurityState.Idle;
    }
}
