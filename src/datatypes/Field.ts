import {
  HTMLFormFieldElement,
  HTMLFormFieldValue,
  HTMLFormFieldTag
} from "@datatypes/base";
import {
  Option,
  none,
  concat as optionconcat,
  fold as optionfold,
  fromString,
  some,
  fromNullable,
  isNone
} from "@datatypes/Option";
import {
  $getfield,
  getFormFieldValue,
  isFormFieldElement,
  isFormFieldValue,
  isFormFieldInternalTag
} from "@operators/dom";

import { HTML_FORM_NATIVE_EVENT_TYPE, HTML_FORM_FIELD_TAG } from "@/constants";
import { isPlainObject } from "@operators/struct";
import { isNonEmptyString } from "@operators/string";

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

export const empty: FormField = Object.freeze({
  $: none as Option<HTMLFormFieldElement>,
  tag: none as Option<HTMLFormFieldTag>,
  name: none as Option<string>,
  value: none as Option<HTMLFormFieldValue>,
  validity: none as Option<Readonly<ValidityState>>,
  touched: false,
  modified: false,
  visited: false
});

export function isFormFieldStruct(x: unknown): x is FormField {
  if (!isPlainObject(x)) return false;
  const requiredProps = Object.keys(empty);
  const hasRequiredProps = Object.keys(x).every((key) =>
    requiredProps.includes(key)
  );
  if (!hasRequiredProps) return false;

  const isOptional = <T>(
    something: unknown,
    refinement: (value: unknown) => boolean
  ): something is T => {
    return (
      isPlainObject(something) &&
      isNonEmptyString(something._is) &&
      ["none", "some"].includes(something._is) &&
      (something._is === "some" ? refinement(something.value) : true)
    );
  };

  return Object.entries(x).reduce(
    (isvalid: boolean, [key, value]: [string, unknown]) => {
      switch (key) {
        case "$": {
          return (
            isvalid &&
            isOptional<Option<HTMLFormFieldElement>>(value, isFormFieldElement)
          );
        }
        case "tag": {
          return (
            isvalid &&
            isOptional<Option<HTMLFormFieldTag>>(value, isFormFieldInternalTag)
          );
        }

        case "name": {
          return isvalid && isOptional<Option<string>>(value, isNonEmptyString);
        }

        case "value": {
          return (
            isvalid &&
            isOptional<Option<HTMLFormFieldValue>>(value, isFormFieldValue)
          );
        }

        case "validity": {
          return (
            isvalid &&
            isOptional<Option<ValidityState>>(
              value,
              (u: unknown) => u instanceof ValidityState
            )
          );
        }

        case "touched":
        case "visited":
        case "modified": {
          return typeof value === "boolean";
        }

        default: {
          return false;
        }
      }
    },
    true
  );
}

export function concat(x: FormField, y: FormField): FormField {
  const concatValidity = (
    a: Readonly<ValidityState>,
    b: Readonly<ValidityState>
  ): Readonly<ValidityState> => ({ ...a, ...b });

  return Object.freeze({
    $: optionconcat(x.$, y.$),
    tag: optionconcat(x.tag, y.tag),
    name: optionconcat(x.name, y.name),
    value: optionconcat(x.value, y.value),
    validity: optionconcat(x.validity, y.validity, concatValidity),
    touched: x.touched || y.touched,
    modified: x.modified || y.modified,
    visited: x.visited || y.visited
  });
}

export function fromElement($field: Element | HTMLFormFieldElement): FormField {
  if (!isFormFieldElement($field)) return empty;
  const name = fromString($field.name, true);
  const tag = some(
    `${$field.tagName}:${$field.type}`.toLowerCase() as HTMLFormFieldTag
  );
  const value = getFormFieldValue($field);

  return Object.freeze(
    concat(empty, {
      $: some($field),
      name,
      tag,
      value,
      validity: some(Object.freeze($field.validity)),
      touched: false,
      modified: false,
      visited: false
    })
  );
}

export function fromDOMParams(
  fieldname: string,
  form: string | HTMLFormElement
): FormField {
  return optionfold<HTMLFormFieldElement, FormField, FormField>(
    () => empty,
    fromElement
  )($getfield(fieldname, form));
}

export function fromFormEvent(evt: Event): FormField {
  const $target = fromNullable(evt.target);
  if (isNone($target)) return empty;
  if (!isFormFieldElement($target.value)) return empty;
  const $field = $target.value;

  const name = fromString($field.name, true);
  const tag = some(
    `${$field.tagName}:${$field.type}`.toLowerCase() as HTMLFormFieldTag
  );
  const value = getFormFieldValue($field);

  const touched = ([
    HTML_FORM_NATIVE_EVENT_TYPE.CHANGE,
    HTML_FORM_NATIVE_EVENT_TYPE.BLUR
  ] as string[]).includes(evt.type);

  const modified = ([HTML_FORM_NATIVE_EVENT_TYPE.CHANGE] as string[]).includes(
    evt.type
  );

  const visited = ([
    HTML_FORM_NATIVE_EVENT_TYPE.FOCUS,
    HTML_FORM_NATIVE_EVENT_TYPE.BLUR
  ] as string[]).includes(evt.type);

  return Object.freeze({
    $: some($field),
    name,
    tag,
    value,
    validity: some(Object.freeze($field.validity)),
    touched,
    modified,
    visited
  });
}

export function updatestatus(
  field: FormField,
  status: FormFieldStatus
): FormField {
  return Object.freeze({ ...field, ...status });
}

export function serialize<T>(field: FormField, nil: T): SerializedFormField<T> {
  const $ = optionfold(
    () => nil,
    (value: HTMLFormFieldElement) => value
  )(field.$);

  const tag = optionfold(
    () => nil,
    (value: HTMLFormFieldTag) => value
  )(field.tag);

  const name = optionfold(
    () => nil,
    (value: string) => value
  )(field.name);

  const validity = optionfold(
    () => nil,
    (value: Readonly<ValidityState>) => value
  )(field.validity);

  const getvalue = (): HTMLFormFieldValue | typeof nil => {
    if (tag === nil) return nil;
    const data = optionfold(
      () => nil,
      (value: HTMLFormFieldValue) => value
    )(field.value);

    if (data === nil) return data;

    switch (tag) {
      case HTML_FORM_FIELD_TAG.INPUT_TEXT:
      case HTML_FORM_FIELD_TAG.INPUT_SEARCH:
      case HTML_FORM_FIELD_TAG.INPUT_EMAIL:
      case HTML_FORM_FIELD_TAG.INPUT_COLOR:
      case HTML_FORM_FIELD_TAG.INPUT_HIDDEN:
      case HTML_FORM_FIELD_TAG.TEXTAREA:
      case HTML_FORM_FIELD_TAG.INPUT_URL:
      case HTML_FORM_FIELD_TAG.INPUT_TEL:
      case HTML_FORM_FIELD_TAG.INPUT_PASSWORD: {
        return String(data);
      }
      case HTML_FORM_FIELD_TAG.INPUT_NUMBER:
      case HTML_FORM_FIELD_TAG.INPUT_RANGE:
      case HTML_FORM_FIELD_TAG.INPUT_DATE:
      case HTML_FORM_FIELD_TAG.INPUT_DATETIME_LOCAL:
      case HTML_FORM_FIELD_TAG.INPUT_TIME:
      case HTML_FORM_FIELD_TAG.INPUT_WEEK:
      case HTML_FORM_FIELD_TAG.INPUT_MONTH: {
        return Number(data);
      }
      case HTML_FORM_FIELD_TAG.INPUT_FILE: {
        return Array.isArray(data)
          ? Object.freeze<Readonly<File>>(
              (data as File[]).map((file) => Object.freeze<File>(file))
            )
          : [];
      }
      case HTML_FORM_FIELD_TAG.INPUT_RADIO:
      case HTML_FORM_FIELD_TAG.INPUT_CHECKBOX:
      case HTML_FORM_FIELD_TAG.SELECT_SINGLE:
      case HTML_FORM_FIELD_TAG.SELECT_MULTIPLE: {
        return Array.isArray(data)
          ? Object.freeze<string>(data.map(String))
          : [];
      }
      default: {
        return nil;
      }
    }
  };

  return Object.freeze({
    $,
    tag,
    name,
    value: getvalue(),
    validity,
    touched: field.touched,
    modified: field.modified,
    visited: field.visited
  });
}
