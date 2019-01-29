import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class PreferencesService {
    private preferences = {};

    constructor(private storage: StorageService) {
        this.loadPreferences();
    }

    private loadPreferences() {
        this.preferences = {};
        if (this.storage.enabled) {
            this.preferences = this.storage.getItem('preferences');
        }
        return this.preferences;
    }
    public setPreference(key: string, value: any) {
        if (!this.preferences) {
            this.preferences = {};
        }
        this.preferences[key] = value;
        if (this.storage.enabled) {
            this.storage.setItem('preferences', this.preferences);
        }
    }
    public getPreference(key: string) {
        if (this.preferences && key in this.preferences) {
            return this.preferences[key];
        }
    }
}
