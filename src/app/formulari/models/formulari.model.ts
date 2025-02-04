export class FormulariModel {
    private _username: string = '';
    private _email: string = '';
    private _errors = {
        username: false,
        email: false
    };

    // Username getter y setter
    get username(): string {
        return this._username;
    }

    setUsername(value: string): void {
        this._username = value;
        this._errors.username = value.trim().length === 0;
    }

    // Email getter y setter
    get email(): string {
        return this._email;
    }

    setEmail(value: string): void {
        this._email = value;
        this._errors.email = !this.validateEmail(value);
    }

    get errors() {
        return this._errors;
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email.length > 0 && emailRegex.test(email);
    }
}
