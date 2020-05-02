import {
  HTML_FORM_FIELD_TAG,
  HTML_FORM_NATIVE_EVENT_TYPE,
  FORM_FIELD_STORAGE_ACTION_TYPE,
  HTML_FORM_CUSTOM_EVENT_TYPE,
  FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE,
  PROGRAM_INTERFACE_ACTION_TYPE
} from "@/constants";
import { FormField, SerializedFormField } from "@datatypes/Field";
import { FormFieldStorage, FormFieldSelectorExpression } from "@/repository";

export type Predicate<T> = (x: T) => boolean;
export type SubmissionHandlerConfigOption = <T, U = never>(
  formvalues: Readonly<Record<string, SerializedFormField<U>>>,
  formdata: FormData
) => T;
export type FormFieldStorageActionFn = (
  type: FormFieldStorageActionType,
  payload?:
    | FormField
    | Array<string | FormField>
    | FormFieldSelectorExpression[]
) => void;

export type FormFieldStorageInterface = Readonly<{
  storage: () => FormFieldStorage;
  action: FormFieldStorageActionFn;
  cleanup?: () => void;
}>;

export type FormEventsActionFn = (
  type: FormFieldsSubscribersActionType,
  payload?: FormFieldSubscriber
) => void;

export type FormEventsInterface = Readonly<{
  subscribers: () => Set<FormFieldSubscriber>;
  action: FormEventsActionFn;
  cleanup?: () => void;
}>;

export type FormFieldSubscriber = <T>(
  formvalues: Readonly<Record<string, SerializedFormField<T>>>
) => void;

export type HTMLFormFieldElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export type HTMLFormFieldValue =
  | string
  | number
  | ReadonlyArray<string>
  | ReadonlyArray<File>;

export type HTMLFormFieldTag = typeof HTML_FORM_FIELD_TAG[keyof typeof HTML_FORM_FIELD_TAG];
export type HTMLFormNativeEventType = typeof HTML_FORM_NATIVE_EVENT_TYPE[keyof typeof HTML_FORM_NATIVE_EVENT_TYPE];
export type FormFieldStorageActionType = typeof FORM_FIELD_STORAGE_ACTION_TYPE[keyof typeof FORM_FIELD_STORAGE_ACTION_TYPE];
export type HTMLFormCustomEventType = typeof HTML_FORM_CUSTOM_EVENT_TYPE[keyof typeof HTML_FORM_CUSTOM_EVENT_TYPE];
export type FormFieldsSubscribersActionType = typeof FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE[keyof typeof FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE];
export type ProgramInterfaceActionType = typeof PROGRAM_INTERFACE_ACTION_TYPE[keyof typeof PROGRAM_INTERFACE_ACTION_TYPE];

export type ProgramInterfaceActionFn = (
  type: ProgramInterfaceActionType,
  payload?: unknown
) => void;
