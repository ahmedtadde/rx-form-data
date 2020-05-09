export declare const HTML_FORM_FIELD_TAG: {
    readonly INPUT_TEXT: "input:text";
    readonly INPUT_NUMBER: "input:number";
    readonly INPUT_EMAIL: "input:email";
    readonly INPUT_PASSWORD: "input:password";
    readonly INPUT_CHECKBOX: "input:checkbox";
    readonly INPUT_RADIO: "input:radio";
    readonly INPUT_COLOR: "input:color";
    readonly INPUT_DATE: "input:date";
    readonly INPUT_DATETIME_LOCAL: "input:datetime-local";
    readonly INPUT_FILE: "input:file";
    readonly INPUT_HIDDEN: "input:hidden";
    readonly INPUT_MONTH: "input:month";
    readonly INPUT_RANGE: "input:range";
    readonly INPUT_SEARCH: "input:search";
    readonly INPUT_TEL: "input:tel";
    readonly INPUT_TIME: "input:time";
    readonly INPUT_URL: "input:url";
    readonly INPUT_WEEK: "input:week";
    readonly TEXTAREA: "textarea:textarea";
    readonly SELECT_SINGLE: "select:select-one";
    readonly SELECT_MULTIPLE: "select:select-multiple";
};
export declare const HTML_FORM_NATIVE_EVENT_TYPE: {
    readonly FOCUS: "focus";
    readonly INPUT: "input";
    readonly CHANGE: "change";
    readonly BLUR: "blur";
    readonly SUBMIT: "submit";
    readonly RESET: "reset";
};
export declare const FORM_FIELD_STORAGE_ACTION_TYPE: {
    readonly REGISTER_ALL: "REGISTER_ALL";
    readonly UNREGISTER_ALL: "UNREGISTER_ALL";
    readonly REGISTER: "REGISTER";
    readonly UNREGISTER: "UNREGISTER";
    readonly UPSERT: "UPSERT_FIELD";
    readonly DELETE: "DELETE_FIELD";
    readonly CLEAR: "CLEAR_FIELDS";
    readonly RESET: "RESET";
    readonly UPSERT_DECODER: "UPSERT_DECODER";
    readonly REMOVE_DECODER: "REMOVE_DECODER";
    readonly CLEAR_DECODERS: "CLEAR_DECODERS";
};
export declare const HTML_FORM_CUSTOM_EVENT_TYPE: {
    readonly EMIT_FORM_VALUES: "EMIT_FORM_VALUES";
};
export declare const FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE: {
    readonly ADD: "ADD";
    readonly DELETE: "DELETE";
    readonly CLEAR: "CLEAR";
};
export declare const PROGRAM_INTERFACE_ACTION_TYPE: {
    readonly REGISTER: "REGISTER_FIELDS";
    readonly REGISTER_ALL: "REGISTER_ALL_FIELDS";
    readonly UNREGISTER: "UNREGISTER_FIELDS";
    readonly UNREGISTER_ALL: "UNREGISTER_ALL_FIELDS";
    readonly ADD_DECODERS: "ADD_DECODERS";
    readonly REMOVE_DECODERS: "REMOVE_DECODERS";
    readonly CLEAR_DECODERS: "CLEAR_DECODERS";
    readonly DESTROY: "DESTROY_PROGRAM";
};
