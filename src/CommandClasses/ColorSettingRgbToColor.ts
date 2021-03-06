import { ZwaveValueId, ColorSettingRgb, ColorRgb, ColorSettingTemperature} from "@scrypted/sdk";
import { ZwaveDeviceBase } from "./ZwaveDeviceBase";

export class ColorSettingRgbToColor extends ZwaveDeviceBase implements ColorSettingRgb, ColorSettingTemperature {
    static numToHex(num: number) {
        return ('00' + Math.round(num).toString(16)).substr(-2);
    }
    // ColorRgb -> '#RRGGBB'
    static rgbToHex(rgb: ColorRgb): string {
        return `#${ColorSettingRgbToColor.numToHex(rgb.r)}${ColorSettingRgbToColor.numToHex(rgb.g)}${ColorSettingRgbToColor.numToHex(rgb.b)}`
    }

    static avg = (2500 + 6500) / 2;
    static deviation = (6500 - 2500) / 2;
    static parseTemperature(rgbwc: string): number {
        var w: number = parseInt("0" + rgbwc.substring(7, 9), 16);
        var c: number = parseInt("0" + rgbwc.substring(9, 11), 16);

        if (w == 0 && c == 0)
            return 0;

        var wratio: number = w / 255;
        var cratio: number = c / 255;

        var temp = ColorSettingRgbToColor.avg - (wratio * ColorSettingRgbToColor.deviation) + (cratio * ColorSettingRgbToColor.deviation);
        return temp;
    }

    // color value is #rrggbbwwcc
    static parseColor(rgbwc: string): ColorRgb {
        // should only report temperature or color, depending on bulb mode.
        // favor color value if kelvin is zero. even if color is 000000/black.
        if (ColorSettingRgbToColor.parseTemperature(rgbwc) != 0)
            return null;

        var r = parseInt(rgbwc.slice(1, 3), 16);
        var g = parseInt(rgbwc.slice(3, 5), 16);
        var b = parseInt(rgbwc.slice(5, 7), 16);
        return {
            r,
            g,
            b,
        }
    }

    setRgb(r: number, g: number, b: number): void {
        this.setValue(ColorSettingRgbToColor, ColorSettingRgbToColor.rgbToHex({
            r,
            g,
            b
        }) + '0000')
    }

    getTemperatureMaxK(): number {
        return 6500;
    }
    getTemperatureMinK(): number {
        return 2500;
    }
    setColorTemperature(kelvin: number): void {
        if (kelvin < ColorSettingRgbToColor.avg) {
            var diff = kelvin - 2500;
            var dratio = diff / ColorSettingRgbToColor.deviation;
            var d = dratio * 255;

            this.setValue(ColorSettingRgbToColor, `#000000FF${ColorSettingRgbToColor.numToHex(d)}`);
        }
        else {
            var diff = 6500 - kelvin;
            var dratio = diff / ColorSettingRgbToColor.deviation;
            var d = dratio * 255;

            this.setValue(ColorSettingRgbToColor, `#000000${ColorSettingRgbToColor.numToHex(d)}FF`);
        }
    }

    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        var value = zwaveDevice.getValue(valueId);
        zwaveDevice.colorTemperature = ColorSettingRgbToColor.parseTemperature(value);
        zwaveDevice.rgb = ColorSettingRgbToColor.parseColor(value);
    }
}

export default ColorSettingRgbToColor;
