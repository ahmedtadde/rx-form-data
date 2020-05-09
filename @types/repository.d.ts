import { FormField } from "./datatypes/Field";
import { Option } from "./datatypes/Option";
import { FormFieldStorageInterface, FormFieldSelectorExpression } from "./datatypes/base";
import { Decoder } from "./datatypes/Decoder";
export declare type FormFieldStorage = Map<string, FormField>;
export declare type FormFieldRegister = Set<FormFieldSelectorExpression>;
export declare type FormDecoders = Map<string, Decoder>;
export declare function put(storage: FormFieldStorage, msg: FormField): FormFieldStorage;
export declare function remove(storage: FormFieldStorage, selection: Array<string | FormField>): FormFieldStorage;
export declare function reset(storage: FormFieldStorage, payload?: FormFieldStorage): FormFieldStorage;
export declare function include(register: FormFieldRegister, payload: FormFieldSelectorExpression[]): FormFieldRegister;
export declare function exclude(storage: FormFieldStorage, register: FormFieldRegister, payload: FormFieldSelectorExpression[]): [FormFieldRegister, FormFieldStorage];
export declare function publish($form: HTMLFormElement, storage: FormFieldStorage): void;
export declare function initialize($formElement: Option<HTMLFormElement>): FormFieldStorageInterface | void;