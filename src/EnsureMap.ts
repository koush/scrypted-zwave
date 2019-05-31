export class EnsureMap<T, M> {
    _map: M;
    constructor(map: M) {
        this._map = map;
    }

    create(key): T {
        return null;
    }

    getOrCreate(key): T {
        var ret: T = this._map[key];
        if (!ret) {
            ret = this._map[key] = this.create(key);
        }
        return ret;
    }
}

export default EnsureMap;