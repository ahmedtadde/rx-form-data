import {
  FormField,
  concat as formfieldconcat,
  isFormFieldStruct
} from "@datatypes/Field";
import {
  Option,
  isNone,
  fromNullable,
  fold as optionfold,
  fromString
} from "@datatypes/Option";
import { isString } from "@operators/string";
import { isNonEmptyString } from "@operators/string";
// import { isFormFieldElement } from "@operators/dom";
import {
  FormFieldStorageActionType,
  FormFieldStorageInterface,
  FormFieldSelectorExpression
} from "@datatypes/base";
import {
  FORM_FIELD_STORAGE_ACTION_TYPE,
  HTML_FORM_CUSTOM_EVENT_TYPE
} from "@/constants";
import { panic } from "@operators/error";
import { isRegExp } from "@operators/string";
import { isPlainObject } from "@operators/struct";
import {
  isFormFieldElement,
  isFormFieldSelectorExpression
} from "./operators/dom";
import { Decoder, isDecoder } from "@datatypes/Decoder";

export type FormFieldStorage = Map<string, FormField>;
export type FormFieldRegister = Set<FormFieldSelectorExpression>;
export type FormDecoders = Map<string, Decoder>;

export function put(
  storage: FormFieldStorage,
  msg: FormField
): FormFieldStorage {
  if (isNone(msg.name)) return storage;
  const key = msg.name.value;
  const oldrecord = fromNullable(storage.get(key));
  const newrecord = optionfold(
    () => msg,
    (record: FormField) => formfieldconcat(record, msg)
  )(oldrecord);

  return storage.set(key, newrecord);
}

export function remove(
  storage: FormFieldStorage,
  selection: Array<string | FormField>
): FormFieldStorage {
  return selection.reduce(
    (updatedstorage: FormFieldStorage, selector: string | FormField) => {
      const key = isString(selector)
        ? fromString(selector, true)
        : selector.name;
      if (isNone(key)) return updatedstorage;
      if (!isNonEmptyString(key.value)) return updatedstorage;
      updatedstorage.delete(key.value.trim());

      return updatedstorage;
    },
    storage
  );
}

export function reset(
  storage: FormFieldStorage,
  payload?: FormFieldStorage
): FormFieldStorage {
  storage.clear();
  return payload ? new Map<string, FormField>(payload.entries()) : storage;
}

export function include(
  register: FormFieldRegister,
  payload: FormFieldSelectorExpression[]
): FormFieldRegister {
  for (let idx = 0, length = payload.length; idx < length; idx++) {
    register.add(payload[idx]);
  }
  return register;
}

export function exclude(
  storage: FormFieldStorage,
  register: FormFieldRegister,
  payload: FormFieldSelectorExpression[]
): [FormFieldRegister, FormFieldStorage] {
  for (let idx = 0, length = payload.length; idx < length; idx++) {
    register.delete(payload[idx]);
  }

  for (const fieldname of storage.keys()) {
    const predicate = payload.some((selection) => {
      if (selection instanceof RegExp) {
        return selection.test(fieldname);
      } else if (isNonEmptyString(selection)) {
        return selection.trim() === fieldname.trim();
      }
      return false;
    });

    if (predicate) {
      storage.delete(fieldname);
    }
  }

  return [register, storage];
}

export function publish(
  $form: HTMLFormElement,
  storage: FormFieldStorage
): void {
  const event = new CustomEvent<Readonly<Map<string, FormField>>>(
    HTML_FORM_CUSTOM_EVENT_TYPE.EMIT_FORM_VALUES,
    {
      detail: Object.freeze(new Map<string, FormField>(storage.entries()))
    }
  );
  $form.dispatchEvent(event);
}

export function initialize(
  $formElement: Option<HTMLFormElement>
): FormFieldStorageInterface | void {
  const storage = new Map<string, FormField>();
  if (isNone($formElement)) {
    panic(
      "[RxFormData] invalid form element for form field storage initialization"
    );
    return;
  }

  const $target = $formElement.value;

  const storageref = new Map<FormFieldStorage, FormFieldStorage>();
  storageref.set(storage, new Map<string, FormField>(storage.entries()));

  const getstorage = (): FormFieldStorage => {
    const latest = storageref.get(storage);
    return latest
      ? new Map<string, FormField>(latest.entries())
      : new Map<string, FormField>();
  };

  const register = new Set<FormFieldSelectorExpression>();
  const registerref = new Map<FormFieldRegister, FormFieldRegister>().set(
    register,
    register
  );
  const getregister = (): FormFieldRegister => {
    const latest = registerref.get(register);
    return latest
      ? new Set<FormFieldSelectorExpression>(latest.values())
      : new Set<FormFieldSelectorExpression>();
  };

  const decoders = new Map<string, Decoder>();
  const decodersref = new Map<FormDecoders, FormDecoders>().set(
    decoders,
    decoders
  );

  const getdecoders = (): FormDecoders => {
    const latest = decodersref.get(decoders);
    return latest
      ? new Map<string, Decoder>(latest.entries())
      : new Map<string, Decoder>();
  };

  const action = (
    type: FormFieldStorageActionType,
    payload?:
      | FormFieldSelectorExpression
      | FormField
      | Array<string | FormField>
      | FormFieldSelectorExpression[]
      | { use: FormFieldSelectorExpression[]; keepvalues: boolean }
      | Decoder[]
  ): void => {
    switch (type) {
      case FORM_FIELD_STORAGE_ACTION_TYPE.UPSERT: {
        if (isFormFieldStruct(payload)) {
          const fieldname = optionfold(
            () => "",
            (value: string) => value.trim()
          )(payload.name);

          const isregistered = [...getregister().keys()].some((expression) => {
            if (isNonEmptyString(expression))
              return expression.trim() === fieldname.trim();
            if (isRegExp(expression)) return expression.test(fieldname);
            return false;
          });

          if (isregistered) {
            storageref.set(storage, put(getstorage(), payload));
            publish($target, getstorage());
          }
        }
        break;
      }
      case FORM_FIELD_STORAGE_ACTION_TYPE.CLEAR: {
        storageref.set(storage, reset(getstorage()));
        registerref.set(register, new Set<FormFieldSelectorExpression>());
        decodersref.set(decoders, new Map<string, Decoder>());
        publish($target, getstorage());
        break;
      }

      case FORM_FIELD_STORAGE_ACTION_TYPE.REGISTER_ALL: {
        const expressions = Array.from($target.elements).reduce(
          (expressions: FormFieldSelectorExpression[], $element) => {
            return isFormFieldElement($element)
              ? expressions.concat($element.name)
              : expressions;
          },
          [] as FormFieldSelectorExpression[]
        );
        registerref.set(
          register,
          new Set<FormFieldSelectorExpression>(expressions)
        );
        break;
      }

      case FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER_ALL: {
        registerref.set(register, new Set<FormFieldSelectorExpression>());
        break;
      }

      case FORM_FIELD_STORAGE_ACTION_TYPE.DELETE: {
        const params = Array.isArray(payload)
          ? (payload as Array<string | FormField>).filter(
              (item: unknown) =>
                isNonEmptyString(item) || isFormFieldStruct(item)
            )
          : [];

        if (params.length) {
          storageref.set(storage, remove(getstorage(), params));
          publish($target, getstorage());
        }

        break;
      }
      case FORM_FIELD_STORAGE_ACTION_TYPE.RESET: {
        storageref.set(storage, reset(getstorage(), storage));
        publish($target, getstorage());
        break;
      }
      case FORM_FIELD_STORAGE_ACTION_TYPE.REGISTER: {
        const params = Array.isArray(payload)
          ? (payload as FormFieldSelectorExpression[]).filter(
              (item: unknown) => isNonEmptyString(item) || isRegExp(item)
            )
          : [];
        if (params.length) {
          registerref.set(register, include(getregister(), params));
        }
        break;
      }
      case FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER: {
        if (payload && isPlainObject(payload)) {
          const params = Array.isArray(payload.use)
            ? (payload.use as FormFieldSelectorExpression[]).filter(
                (item: unknown) => isNonEmptyString(item) || isRegExp(item)
              )
            : [];

          if (params.length) {
            const result = exclude(getstorage(), getregister(), params);
            registerref.set(register, result[0]);
            if (!payload.keepvalues) {
              storageref.set(storage, result[1]);
              publish($target, getstorage());
            }
          }
        } else {
          const params = Array.isArray(payload)
            ? (payload as FormFieldSelectorExpression[]).filter(
                (item: unknown) => isNonEmptyString(item) || isRegExp(item)
              )
            : [];
          if (params.length) {
            const result = exclude(getstorage(), getregister(), params);
            registerref.set(register, result[0]);
          }
        }
        break;
      }

      case FORM_FIELD_STORAGE_ACTION_TYPE.UPSERT_DECODER: {
        if (Array.isArray(payload) && payload.every(isDecoder)) {
          const collection = getdecoders();
          for (let idx = 0, length = payload.length; idx < length; idx++) {
            const decoder = payload[idx] as Decoder;
            collection.set(decoder.name, decoder);
          }
          decodersref.set(decoders, collection);
        }
        break;
      }

      case FORM_FIELD_STORAGE_ACTION_TYPE.REMOVE_DECODER: {
        if (Array.isArray(payload)) {
          const collection = getdecoders();
          for (let idx = 0, length = payload.length; idx < length; idx++) {
            const expression = payload[idx];
            if (!isFormFieldSelectorExpression(expression)) continue;
            for (const [key] of collection) {
              if (isNonEmptyString(expression) && expression === key) {
                collection.delete(key);
              } else if (isRegExp(expression) && expression.test(key)) {
                collection.delete(key);
              }
            }
          }
          decodersref.set(decoders, collection);
        }
        break;
      }

      case FORM_FIELD_STORAGE_ACTION_TYPE.CLEAR_DECODERS: {
        decodersref.set(decoders, new Map<string, Decoder>());
        break;
      }
    }
  };

  return {
    storage: getstorage,
    decoders: getdecoders,
    action
  } as const;
}
