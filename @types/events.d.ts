import { FormFieldStorage, FormDecoders } from "./repository";
import { FormField, SerializedFormField } from "./datatypes/Field";
import { FormFieldStorageActionFn, FormFieldStorageInterface, FormEventsInterface, SubmissionHandlerConfigOption } from "./datatypes/base";
import { Option } from "./datatypes/Option";
import { DecoderResult } from "./datatypes/Decoder";
export declare function onsubmit($form: HTMLFormElement, storage: FormFieldStorage, decoders: FormDecoders, handler: <U>(formvalues: Readonly<Record<string, SerializedFormField<U>>>, formvalidation: Error | Readonly<Record<string, Readonly<DecoderResult>>>, formdata: FormData) => unknown): Promise<unknown>;
export declare function onfieldevent(evt: Event, action: FormFieldStorageActionFn): void;
export declare function getFormEventListener($target: HTMLFormElement, submissionHanlder: SubmissionHandlerConfigOption, storageinterface: FormFieldStorageInterface, subscribersinterface: FormEventsInterface): (evt: Event | CustomEvent<Readonly<Map<string, FormField>>>) => void;
export declare function initialize($formElement: Option<HTMLFormElement>, submissionHanlder: SubmissionHandlerConfigOption, storageinterface: FormFieldStorageInterface): FormEventsInterface | void;
