import sdk, { PasswordStore, ZwaveValueId, ScryptedInterface } from "@scrypted/sdk";
import { ZwaveFunction, ZwaveDeviceBase } from "./ZwaveDeviceBase";
const {zwaveManager, deviceManager} = sdk;

function isEmpty(str: string) {
    return !str || !str.length;
}

export class PasswordStoreToUserCode extends ZwaveDeviceBase implements PasswordStore {
    static INDEX_CODE_COUNT = 255;
    static INDEX_REFRESH_ALL_USER_CODES = 254;
    static INDEX_ENROLLMENT_CODE = 0;
    static INDEX_USER_CODE_START = 1;

    _getPasswords(): Set<string> {
        var ret = new Set<string>();
        for (var i = 0; i < this.getPasswordCount(); i++) {
            var password = this.getPassword(i);
            if (isEmpty(password)) {
                continue;
            }
            ret.add(password);
        }
        return ret;
    }

    getPasswords(): string[] {
        return Array.from(this._getPasswords());
    }

    getPasswordCount(): number {
        var valueId = this.getValueId();
        var f: ZwaveFunction = PasswordStoreToUserCode;
        Object.assign(valueId, f.valueId);
        valueId.index = PasswordStoreToUserCode.INDEX_CODE_COUNT;
        return parseInt(this.getValue(valueId));
    }

    static rawToString(raw: string): string {
        var parts = raw.split(" ");

        if (parts.length > 0 && "0x00" === parts[0])
            return null;

        var ret = '';
        for (var part of parts) {
            if (!part.startsWith("0x"))
                return null;
            var b = parseInt(part.replace("0x", ""), 16);
            ret += String.fromCharCode(b);
        }
        return ret;
    }

    static stringToRaw(value: string): string {
        var ret = [];
        for (var i = 0; i < value.length; i++) {
            var code = '00' + value.charCodeAt(i).toString(16);
            var hex = '0x' + code.slice(-2);
            ret.push(hex);
        }
        return ret.join(' ');
    }

    getPassword(index: number): string {
        var known = this.storage.getItem("password-" + index);
        if (!isEmpty(known)) {
            return known;
        }

        var valueId: ZwaveValueId = this.getValueId();
        var f: ZwaveFunction = PasswordStoreToUserCode;
        Object.assign(valueId, f.valueId);
        valueId.index = PasswordStoreToUserCode.INDEX_USER_CODE_START + index;

        return PasswordStoreToUserCode.rawToString(this.getValue(valueId));
    }

    addPassword(password: string): void {
        for (var i = 0; i < this.getPasswordCount(); i++) {
            var existing = this.getPassword(i);
            if (isEmpty(existing) || password === existing) {
                this.log.i(`Setting code ${password} on code ${i} (index ${PasswordStoreToUserCode.INDEX_USER_CODE_START + i})`);
                this.setPassword(i, password);
                this.storage.setItem("password-" + i, password);
                return;
            }
        }

        this.notifyChange();
    }
    setPassword(index: number, password: string) {
        var valueId: ZwaveValueId = this.getValueId()
        var f: ZwaveFunction = PasswordStoreToUserCode;
        Object.assign(valueId, f.valueId);
        valueId.index = PasswordStoreToUserCode.INDEX_USER_CODE_START + index;

        zwaveManager.setValueRaw(valueId, Buffer.from(password));
    }
    removePassword(password: string): void {
        for (var i = 0; i < this.getPasswordCount(); i++) {
            var existing = this.getPassword(i);
            if (password === existing) {
                this.setPassword(i, "");
                this.storage.removeItem("password-" + i);
            }
        }

        this.notifyChange();
    }
    checkPassword(password: string): boolean {
        return this._getPasswords().has(password);
    }
    notifyChange() {
        deviceManager.onDeviceEvent(ScryptedInterface.PasswordStore, null);
    }
    static onValueChanged(zwaveDevice: ZwaveDeviceBase, valueId: ZwaveValueId) {
        var pass = zwaveDevice as PasswordStoreToUserCode;
        pass.notifyChange();
    }
}
