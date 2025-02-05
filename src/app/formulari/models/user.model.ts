export class User {
    constructor(
  
        private _username: string = '',
        private _email: string = '',
        private _password: string = '',
        private _confirmPassword: string = ''
    ) {}
  
    //Getters
    get username(): string {
      return this._username; 
    }
  
    get email(): string {
      return this._email;
    }
  
    get password(): string {
      return this._password;
    }
  
    get confirmPassword(): string {
      return this._confirmPassword;
    }
    //Setters
    set username(value: string) {
      this._username = value;
    }
  
    set email(value: string){
      this._email = value
    }
  
    set password(value: string){
      this._password = value;
    }
  
    set confirmPassword(value: string){
    this._confirmPassword = value
    }
  
    validate(): { isValid: boolean, errors: any } {
      const errors: any = {
        username: !this._username,
        email: !this._email,
        password: !this._password,
        confirmPasswordEmpty: !this._confirmPassword,
        confirmPassword: !this._confirmPassword || !this.passwordMatch(),
        passwordRegex: this._password ? !this.passwordValidator(): false,
      };
      const isValid = Object.values(errors).every(error => !error);
      return { isValid, errors };
    }
  
    passwordMatch(): boolean {
      return this._password === this._confirmPassword;
    }
  
    passwordValidator(): boolean {
      const minLength = 6;
      const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
      return this._password.length >= minLength && symbolRegex.test(this._password);
    }
  
    clear(): void {
      this._username = '';
      this._email = '';
      this._password = '';
      this._confirmPassword = '';
    }
  }