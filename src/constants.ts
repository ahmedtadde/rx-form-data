export const HTML_FORM_FIELD_TAG = {
  INPUT_TEXT: "input:text",
  INPUT_NUMBER: "input:number",
  INPUT_EMAIL: "input:email",
  INPUT_PASSWORD: "input:password",
  INPUT_CHECKBOX: "input:checkbox",
  INPUT_RADIO: "input:radio",
  INPUT_COLOR: "input:color",
  INPUT_DATE: "input:date",
  INPUT_DATETIME_LOCAL: "input:datetime-local",
  INPUT_FILE: "input:file",
  INPUT_HIDDEN: "input:hidden",
  INPUT_MONTH: "input:month",
  INPUT_RANGE: "input:range",
  INPUT_SEARCH: "input:search",
  INPUT_TEL: "input:tel",
  INPUT_TIME: "input:time",
  INPUT_URL: "input:url",
  INPUT_WEEK: "input:week",
  TEXTAREA: "textarea:textarea",
  SELECT_SINGLE: "select:select-one",
  SELECT_MULTIPLE: "select:select-multiple"
} as const;

export const HTML_FORM_NATIVE_EVENT_TYPE = {
  FOCUS: "focus",
  INPUT: "input",
  CHANGE: "change",
  BLUR: "blur",
  SUBMIT: "submit",
  RESET: "reset"
} as const;

export const FORM_FIELD_STORAGE_ACTION_TYPE = {
  REGISTER: "REGISTER",
  UNREGISTER: "UNREGISTER",
  UPSERT: "UPSERT_FIELD",
  DELETE: "DELETE_FIELD",
  CLEAR: "CLEAR_FIELDS",
  RESET: "RESET"
} as const;

export const HTML_FORM_CUSTOM_EVENT_TYPE = {
  EMIT_FORM_VALUES: "EMIT_FORM_VALUES"
} as const;

export const FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE = {
  ADD: "ADD",
  DELETE: "DELETE",
  CLEAR: "CLEAR"
} as const;

export const PROGRAM_INTERFACE_ACTION_TYPE = {
  REGISTER: "REGISTER_FIELDS",
  UNREGISTER: "UNREGISTER_FIELDS",
  DESTROY: "DESTROY_PROGRAM"
} as const;
