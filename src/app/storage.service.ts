import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private ls: Storage = localStorage;

    public enabled: boolean = true;

    constructor() {
        if (!this.ls) {
            this.enabled = false;
        }
    }

    setItem(key: string, value: any) {
        if (this.enabled) {
            this.ls.setItem(key, JSON.stringify(value));
        }
    }
    getItem(key: string) {
        if (this.enabled) {
            var str = this.ls.getItem(key);
            if (str) {
                return JSON.parse(str);
            }
        }
        return null;
    }
    hasItem(key: string) {
        return this.ls.length > 0 && this.ls.getItem(key) !== null;
    }
    removeItem(key: string) {
        if (this.enabled) {
            this.ls.removeItem(key);
        }
    }
}
