export class userLogin {
    constructor(
        private _email: string = '',
        private _password: string = ''
    ) {}
  
    //Getters
    get email(): string {
      return this._email
    }
    get password(): string {
      return this._password;
    }
  
    //Setters
    set email(value: string){
      this._email = value;
    }
  
    set password(value: string){
      this._password = value;
    }
  
    validate(): { isValid: boolean, errors: any } {
      const errors: any = {
        email: !this._email,
        password: !this._password,
      };
  
      const isValid = Object.values(errors).every(error => !error);
      return { isValid, errors };
    }
  
     clear(): void {
      this._email = '';
      this._password = '';
    }
  }