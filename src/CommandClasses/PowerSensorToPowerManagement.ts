import { ZwaveValueId, PowerSensor } from "@scrypted/sdk";
import { Notification } from "./Notification";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

enum PowerState {
  Idle = 0,
  PowerApplied,
}

export class PowerSensorToPowerManagement extends Notification implements PowerSensor {
  static powerStates = [
    PowerState.PowerApplied,
  ];

  static getInterfaces(valueId: ZwaveValueId): string[] {
    if (Notification.checkInterface(valueId, PowerState.PowerApplied)) {
      return ['PowerSensor'];
    }
    return null;
  }

  static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
    var state = zwaveDevice.getValueListValue(valueId);
    if (state === undefined) {
      return;
    }

    if (!zwaveDevice.device.interfaces.includes('PowerSensor')) {
      return;
    }

    zwaveDevice.powerDetected = this.powerStates.includes(state);
  }
}
