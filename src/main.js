// 1) Create a new Script under Plugins.
// 2) Set the type to Device.
// 3) Select/check the OnOff interface.
// 4) Click the Debug button.
// 4) Save.
// 5) Edit .vcode/settings.json and set the value of "scrypted.debugHost": "THIS.IS.MY.IP"
// 6) Launch Scrypted Debugger in VS Code.

import axios from 'axios';

log.i('Hello World. This will create a virtual OnOff device.');

function Device() {
}

Device.prototype.isOn = function () {
    log.i('isOn was called!');
    return false;
};

Device.prototype.turnOff = function () {
    // set a breakpoint here.
    log.i('turnOff was called!');
};

Device.prototype.turnOn = function () {
    // set a breakpoint here.
    log.i('turnOn was called!');

    // turnOn must return immediately, but it can trigger other things... 
    (async function () {
        log.i('XMLHttpRequest is polyfilled by the Android host. This allows the popular http library axios or jquery ajax to work.');

        const ip = await axios.get('http://jsonip.com');
        log.i(`my ip: ${ip.data.ip}`);
    })();
};



exports.default = new Device();
