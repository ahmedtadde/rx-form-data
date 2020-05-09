import { HTML_FORM_FIELD_TAG, HTML_FORM_NATIVE_EVENT_TYPE, FORM_FIELD_STORAGE_ACTION_TYPE, HTML_FORM_CUSTOM_EVENT_TYPE, FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE, PROGRAM_INTERFACE_ACTION_TYPE } from "../constants";
import { FormField, SerializedFormField } from "./Field";
import { FormFieldStorage, FormDecoders } from "../repository";
import { DecoderResult, Decoder } from "./Decoder";
export declare type Predicate<T> = (x: T) => boolean;
export declare type SubmissionHandlerConfigOption = <T, U = never>(formvalues: Readonly<Record<string, SerializedFormField<U>>>, formvalidation: Error | Readonly<Record<string, Readonly<DecoderResult>>>, formdata: FormData) => T;
export declare type FormFieldStorageActionFn = (type: FormFieldStorageActionType, payload?: FormFieldSelectorExpression | FormField | Array<string | FormField> | FormFieldSelectorExpression[] | {
    use: FormFieldSelectorExpression[];
    keepvalues: boolean;
} | Decoder[]) => void;
export declare type FormFieldStorageInterface = Readonly<{
    storage: () => FormFieldStorage;
    decoders: () => FormDecoders;
    action: FormFieldStorageActionFn;
    cleanup?: () => void;
}>;
export declare type FormEventsActionFn = (type: FormFieldsSubscribersActionType, payload?: FormFieldSubscriber) => void;
export declare type FormEventsInterface = Readonly<{
    subscribers: () => Set<FormFieldSubscriber>;
    action: FormEventsActionFn;
    cleanup?: () => void;
}>;
export declare type FormFieldSubscriber = <T>(formvalues: Readonly<Record<string, SerializedFormField<T>>>, formvalidation: Error | Readonly<Record<string, Readonly<DecoderResult>>>) => void;
export declare type HTMLFormFieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare type HTMLFormFieldValue = string | number | ReadonlyArray<string> | ReadonlyArray<File>;
export declare type FormFieldSelectorExpression = string | RegExp;
export declare type HTMLFormFieldTag = typeof HTML_FORM_FIELD_TAG[keyof typeof HTML_FORM_FIELD_TAG];
export declare type HTMLFormNativeEventType = typeof HTML_FORM_NATIVE_EVENT_TYPE[keyof typeof HTML_FORM_NATIVE_EVENT_TYPE];
export declare type FormFieldStorageActionType = typeof FORM_FIELD_STORAGE_ACTION_TYPE[keyof typeof FORM_FIELD_STORAGE_ACTION_TYPE];
export declare type HTMLFormCustomEventType = typeof HTML_FORM_CUSTOM_EVENT_TYPE[keyof typeof HTML_FORM_CUSTOM_EVENT_TYPE];
export declare type FormFieldsSubscribersActionType = typeof FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE[keyof typeof FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE];
export declare type ProgramInterfaceActionType = typeof PROGRAM_INTERFACE_ACTION_TYPE[keyof typeof PROGRAM_INTERFACE_ACTION_TYPE];
export declare type ProgramInterfaceActionFn = (type: ProgramInterfaceActionType, payload?: unknown) => void;
