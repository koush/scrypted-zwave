import { ZwaveValueId, FloodSensor } from "@scrypted/sdk";
import { Notification } from "./Notification";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

enum WaterAlarmEventState {
    Idle = 0,
    WaterLeakLocationProvided,
    WaterLeak,
    WaterLevelDroppedLocationProvided,
    WaterLevelDropped,
    ReplaceFilter,
    WaterPressure,
    WaterTemperature,
    WaterLevel,
    SumpPumpActive,
    SumpPumpFailure,
}

export class FloodSensorToWaterAlarm extends Notification implements FloodSensor {
    static floodStates = [
        WaterAlarmEventState.WaterLeak,
        WaterAlarmEventState.WaterLeakLocationProvided
    ];

    static getInterfaces(valueId: ZwaveValueId): string[] {
        if (Notification.checkInterface(valueId, WaterAlarmEventState.WaterLeakLocationProvided, WaterAlarmEventState.WaterLeak)) {
            return ['FloodSensor'];
        }
        return null;
    }

    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        var state = zwaveDevice.getValueListValue(valueId);
        if (state === undefined) {
            return;
        }

        if (!zwaveDevice.device.interfaces.includes('FloodSensor')) {
            return;
        }

        zwaveDevice.flooded = !this.floodStates.includes(state);
    }
}
