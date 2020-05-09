import { HTMLFormFieldElement, HTMLFormFieldValue, HTMLFormFieldTag } from "./base";
import { Option } from "./Option";
export interface FormFieldStatus {
    readonly touched: boolean;
    readonly modified: boolean;
    readonly visited: boolean;
}
export interface FormField extends FormFieldStatus {
    readonly $: Option<HTMLFormFieldElement>;
    readonly tag: Option<HTMLFormFieldTag>;
    readonly name: Option<string>;
    readonly value: Option<HTMLFormFieldValue>;
    readonly validity: Option<Readonly<ValidityState>>;
}
export interface SerializedFormField<T> {
    readonly $: HTMLFormFieldElement | T;
    readonly tag: HTMLFormFieldTag | T;
    readonly name: string | T;
    readonly value: HTMLFormFieldValue | T;
    readonly validity: Readonly<ValidityState> | T;
    readonly touched: boolean;
    readonly modified: boolean;
    readonly visited: boolean;
}
export declare const empty: FormField;
export declare function isFormFieldStruct(x: unknown): x is FormField;
export declare function concat(x: FormField, y: FormField): FormField;
export declare function fromElement($field: Element | HTMLFormFieldElement): FormField;
export declare function fromDOMParams(fieldname: string, form: string | HTMLFormElement): FormField;
export declare function fromFormEvent(evt: Event): FormField;
export declare function updatestatus(field: FormField, status: FormFieldStatus): FormField;
export declare function serialize<T>(field: FormField, nil: T): SerializedFormField<T>;
