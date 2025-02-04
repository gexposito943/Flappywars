export abstract class BaseModel {
    abstract getData(): any;
    abstract setData(data: any): void;
    abstract validate(): boolean;
} 