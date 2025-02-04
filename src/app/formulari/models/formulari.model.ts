export class FormulariModel {
    private _username: string = '';
    private _errors = {
        username: false
    };

    // Username getter y setter
    get username(): string {
        return this._username;
    }

    setUsername(value: string): void {
        this._username = value;
        this._errors.username = value.trim().length === 0;
    }

    get errors() {
        return this._errors;
    }
}
