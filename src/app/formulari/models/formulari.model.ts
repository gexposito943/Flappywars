/**
 * Model que gestiona les dades del formulari
 * Conté les validacions i l'estat dels errors
 */
export class FormulariModel {
    private _username: string = '';
    private _email: string = '';
    private _password: string = '';
    private _confirmPassword: string = '';
    private _errors = {
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
        passwordRegex: false
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

    set email(value: string) {
        this.setEmail(value);
    }

    // Password getters y setters
    get password(): string {
        return this._password;
    }

    setPassword(value: string): void {
        this._password = value;
        this._errors.password = !this.validatePassword(value);
        if (this._confirmPassword) {
            this.validatePasswordMatch();
        }
    }

    set password(value: string) {
        this.setPassword(value);
    }

    get confirmPassword(): string {
        return this._confirmPassword;
    }

    setConfirmPassword(value: string): void {
        this._confirmPassword = value;
        this.validatePasswordMatch();
    }

    get errors() {
        return this._errors;
    }

    get isValid(): boolean {
        return !this._errors.username && 
               !this._errors.email && 
               !this._errors.password && 
               !this._errors.confirmPassword &&
               !this._errors.passwordRegex;
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email.length > 0 && emailRegex.test(email);
    }

    private validatePassword(password: string): boolean {
        const minLength = 6;
        const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
        return password.length >= minLength && symbolRegex.test(password);
    }

    private validatePasswordMatch(): void {
        this._errors.confirmPassword = 
            this._password !== this._confirmPassword || 
            this._confirmPassword.length === 0;
    }

    clearInputs(): void {
        this._username = '';
        this._email = '';
        this._password = '';
        this._confirmPassword = '';
        this.resetErrors();
    }

    private resetErrors(): void {
        Object.keys(this._errors).forEach(key => {
            this._errors[key as keyof typeof this._errors] = false;
        });
    }
}
