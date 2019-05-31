import Switch from "./OnOffToSwitch";
import BrightnessToSwitchMultilevel from "./BrightnessToSwitchMultilevel";
import { ZwaveValueId } from "../../../scrypted-deploy";
import { ZwaveFunction } from "./ZwaveDeviceBase";
import OnOffToSwitch from "./BinarySensorToStateSensor";
import LockToDoorLock from "./LockToDoorLock";
import BatteryToBattery from "./BatteryToBattery";
import ThermometerToSensorMultilevel from "./ThermometerToSensorMultilevel";
import HumidityToSensorMultilevel from "./HumiditySensorToSensorMultilevel";
import LuminanceSensorToSensorMultilevel from "./LuminanceSensorToSensorMultilevel";
import UltravioletSensorMultilevel from "./UltravioletSensorToSensorMultilevel";
import SettingsToConfiguration from "./SettingsToConfiguration";

var CommandClassMap = {};

export class CommandClassInfo {
    clazz: ZwaveFunction;
    interfaces: string[];
}

function addCommandClassIndex(commandClass: number, index: number, clazz: Function, ...interfaces: string[]) {
    var cc: CommandClassInfo = new CommandClassInfo();

    var valueId: ZwaveValueId = {};
    valueId.commandClass = commandClass;
    valueId.index = index;

    var zwaveClass: ZwaveFunction = clazz;
    zwaveClass.valueId = valueId; 

    cc.clazz = zwaveClass;
    cc.interfaces = interfaces;
    CommandClassMap[`${commandClass}#${index}`] = cc;
}

function addCommandClass(commandClass: number, clazz: Function, ...interfaces: string[]) {
    var cc: CommandClassInfo = new CommandClassInfo();

    var valueId: ZwaveValueId = {};
    valueId.commandClass = commandClass;

    var zwaveClass: ZwaveFunction = clazz;
    zwaveClass.valueId = valueId; 

    cc.clazz = zwaveClass;
    cc.interfaces = interfaces;
    CommandClassMap[`${commandClass}`] = cc;
}

export function getCommandClassIndex(commandClass: number, index: number): CommandClassInfo {
    return CommandClassMap[`${commandClass}#${index}`];
}

export function getCommandClass(commandClass: number): CommandClassInfo {
    return CommandClassMap[`${commandClass}`];
}

enum SensorType
{
    SensorType_Unknown = 0, // 0, placeholder
    SensorType_Temperature, // 1
    SensorType_General,
    SensorType_Luminance,
    SensorType_Power,
    SensorType_RelativeHumidity,
    SensorType_Velocity,
    SensorType_Direction,
    SensorType_AtmosphericPressure,
    SensorType_BarometricPressure,
    SensorType_SolarRadiation,
    SensorType_DewPoint,
    SensorType_RainRate,
    SensorType_TideLevel,
    SensorType_Weight,
    SensorType_Voltage,
    SensorType_Current,
    SensorType_CO2,
    SensorType_AirFlow,
    SensorType_TankCapacity,
    SensorType_Distance,
    SensorType_AnglePosition,
    SensorType_Rotation,
    SensorType_WaterTemperature,
    SensorType_SoilTemperature,
    SensorType_SeismicIntensity,
    SensorType_SeismicMagnitude,
    SensorType_Ultraviolet,
    SensorType_ElectricalResistivity,
    SensorType_ElectricalConductivity,
    SensorType_Loudness,
    SensorType_Moisture,
    SensorType_MaxType
}

addCommandClassIndex(0x25, 0, Switch, 'OnOff');
addCommandClassIndex(0x26, 0, BrightnessToSwitchMultilevel, 'Brightness', 'OnOff');
addCommandClassIndex(0x30, 0, OnOffToSwitch, 'BinarySensor');
addCommandClassIndex(0x62, 0, LockToDoorLock, 'Lock');
addCommandClassIndex(0x80, 0, BatteryToBattery, 'Battery');
addCommandClassIndex(0x31, SensorType.SensorType_Temperature, ThermometerToSensorMultilevel, 'Thermometer');
addCommandClassIndex(0x31, SensorType.SensorType_RelativeHumidity, HumidityToSensorMultilevel, 'HumiditySensor');
addCommandClassIndex(0x31, SensorType.SensorType_Luminance, LuminanceSensorToSensorMultilevel, 'LuminanceSensor');
addCommandClassIndex(0x31, SensorType.SensorType_Ultraviolet, UltravioletSensorMultilevel, 'UltravioletSensor');

addCommandClass(0x70, SettingsToConfiguration, 'Settings');