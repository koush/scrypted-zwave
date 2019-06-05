import { EntrySensor, ZwaveValueId } from "@scrypted/sdk";
import { Notification } from "./Notification";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

enum AccessControlEventState {
    Idle = 0x0,
    ManualLock = 0x1,
    ManualUnlock = 0x2,
    RFLock = 0x3,
    RFUnlock = 0x4,
    KeypackLock = 0x5,
    KeypadUnlock = 0x6,
    ManualNotFullyLocked = 0x7,
    RFNotFullyLocked = 0x8,
    AutoLock = 0x9,
    AutoLockNotFullyLocked = 0xA,
    LockJammed = 0xB,
    AllUserCodesDeleted = 0xC,
    SingleUserCodeDeleted = 0xD,
    NewUserCodeAdded = 0xE,
    NewUserCodeNotAddedDuplicate = 0xF,
    KeyboardTemporarilyDisabled = 0x10,
    KeypadBusy = 0x11,
    NewProgramCodeEntered = 0x12,
    ManuallyEnterUserAccessCodeExceedsCodeLimit = 0x13,
    UnlockByRFWithInvalidUserCode = 0x14,
    LockedByRFWithInvalidUserCode = 0x15,
    WindowDoorOpen = 0x16,
    WindowDoorClosed = 0x17,
    WindowDoorHandleOpen = 0x18,
    WindowDoorHandleClosed = 0x19,
    MessagungUserCodeEnteredKeypad = 0x20,
    BarrierPerformingInitialization = 0x40,
    BarrerOperationForceExceeded = 0x41,
    BarrierMotorExceededOperationTimeLimit = 0x42,
    BarrierOperationExceededMechanicalLimit = 0x43,
    BarrierUnableToPerformDueULReq = 0x44,
    BarrierUnattendedDisabled = 0x45,
    BarrierFailedRequest = 0x46,
    BarrierVacationMode = 0x47,
    BarrierSafetyBeamObstacle = 0x48,
    BarrierSensorNotDetected = 0x49,
    BarrierSensorLowBattery = 0x4A,
    BarrierDetectedShort = 0x4B,
    BarrierAssociatedWIthNonZwave = 0x4C
};

export class EntrySensorToAccessControl extends Notification implements EntrySensor {
    static closedStates = [
        AccessControlEventState.WindowDoorClosed,
        AccessControlEventState.WindowDoorHandleClosed
    ];

    static entryStates = [
        AccessControlEventState.WindowDoorOpen,
        AccessControlEventState.WindowDoorHandleOpen,
        AccessControlEventState.WindowDoorClosed,
        AccessControlEventState.WindowDoorHandleClosed
    ];

    static lockStates = [
        AccessControlEventState.ManualLock,
        AccessControlEventState.ManualUnlock,
        AccessControlEventState.RFLock,
        AccessControlEventState.RFUnlock,
        AccessControlEventState.KeypackLock,
        AccessControlEventState.KeypadUnlock,
        AccessControlEventState.ManualNotFullyLocked,
        AccessControlEventState.RFNotFullyLocked,
        AccessControlEventState.AutoLock,
        AccessControlEventState.AutoLockNotFullyLocked,
        AccessControlEventState.LockJammed,
        AccessControlEventState.UnlockByRFWithInvalidUserCode,
        AccessControlEventState.LockedByRFWithInvalidUserCode,
    ]

    static getInterfaces(valueId: ZwaveValueId): string[] {
        if (Notification.checkInterface(valueId, AccessControlEventState.WindowDoorOpen, AccessControlEventState.WindowDoorClosed) ||
            Notification.checkInterface(valueId, AccessControlEventState.WindowDoorOpen, AccessControlEventState.WindowDoorClosed)) {
            return ['EntrySensor'];
        }
        return null;
    }

    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        var state = zwaveDevice.getValueListValue(valueId);
        if (state === undefined) {
            return;
        }

        // schlage locks send notifications of lock change events, but does not change the actual lock command class value.
        // so force a refresh.
        if (EntrySensorToAccessControl.lockStates.includes(state)) {
            zwaveDevice.refresh('Lock', false);
            return;
        }

        // should we check explictly for entry sensor states?
        // if (!EntrySensorToAccessControl.entryStates.includes(state)) {
        //     return;
        // }

        if (!zwaveDevice.device.interfaces.includes('EntrySensor')) {
            return;
        }

        zwaveDevice.entryOpen = !this.closedStates.includes(state);
    }
}