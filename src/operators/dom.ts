import {
  Option,
  isNone,
  fromNullable,
  fromString,
  none,
  some,
  fromNaN,
  fold as optionfold
} from "@datatypes/Option";
import {
  HTMLFormFieldElement,
  HTMLFormFieldValue,
  HTMLFormFieldTag,
  FormFieldSelectorExpression
} from "@datatypes/base";
import { isNonEmptyString, isString, isRegExp } from "@operators/string";
import { HTML_FORM_FIELD_TAG } from "@/constants";

export function isFormElement(x: unknown): x is HTMLFormElement {
  return x instanceof HTMLFormElement;
}

export function isInputFieldElement(x: unknown): x is HTMLInputElement {
  return x instanceof HTMLInputElement;
}

export function isTextareaFieldElement(x: unknown): x is HTMLTextAreaElement {
  return x instanceof HTMLTextAreaElement;
}

export function isSelectFieldElement(x: unknown): x is HTMLSelectElement {
  return x instanceof HTMLSelectElement;
}

export function isFormFieldElement(x: unknown): x is HTMLFormFieldElement {
  return (
    isInputFieldElement(x) ||
    isSelectFieldElement(x) ||
    isTextareaFieldElement(x)
  );
}

export function $getform(x: unknown): Option<HTMLFormElement> {
  if (isFormElement(x)) return some(x);
  if (isNone(fromString(x, true))) return none;
  const $form = fromNullable(
    document.querySelector(`form#${(x as string).trim()}`)
  );
  if (isNone($form)) return none;
  if (!isFormElement($form.value)) return none;

  return some($form.value);
}

export function $getfield(
  x: unknown,
  y?: unknown
): Option<HTMLFormFieldElement> {
  if (isFormFieldElement(x)) return some(x);
  if (!isNonEmptyString(x)) return none;

  if (y instanceof HTMLFormElement) {
    const $field = fromNullable(y.querySelector(`[name="${x.trim()}"]`));
    if (isNone($field)) return none;
    if (!isFormFieldElement($field.value)) return none;
    return some($field.value);
  } else {
    const _y = isNonEmptyString(y) ? `form#${y.trim()}` : "form";
    const $field = fromNullable(
      document.querySelector(`${_y} [name="${(x as string).trim()}"]`)
    );
    if (isNone($field)) return none;
    if (!isFormFieldElement($field.value)) return none;

    return some($field.value);
  }
}

export function getInputFieldValue(
  $target: unknown
): Option<HTMLFormFieldValue> {
  if (!isInputFieldElement($target)) return none;
  const fieldtag = `${$target.tagName.toLowerCase()}:${
    $target.type
  }` as HTMLFormFieldTag;

  switch (fieldtag) {
    case HTML_FORM_FIELD_TAG.INPUT_TEXT:
    case HTML_FORM_FIELD_TAG.INPUT_SEARCH:
    case HTML_FORM_FIELD_TAG.INPUT_EMAIL:
    case HTML_FORM_FIELD_TAG.INPUT_COLOR:
    case HTML_FORM_FIELD_TAG.INPUT_HIDDEN: {
      return some($target.value.trim());
    }
    case HTML_FORM_FIELD_TAG.INPUT_PASSWORD: {
      return some($target.value);
    }
    case HTML_FORM_FIELD_TAG.INPUT_NUMBER:
    case HTML_FORM_FIELD_TAG.INPUT_RANGE: {
      return fromNaN(Number($target.value.trim()));
    }
    case HTML_FORM_FIELD_TAG.INPUT_URL: {
      try {
        return some(new URL($target.value.trim()).href.trim());
      } catch (error) {
        console.warn(
          "[RxFormData] Failed to decode url input field value into URL object",
          $target.value,
          error
        );
        return none;
      }
    }
    case HTML_FORM_FIELD_TAG.INPUT_TEL: {
      return some($target.value.trim().replace(/\D/g, ""));
    }
    case HTML_FORM_FIELD_TAG.INPUT_FILE: {
      return optionfold<
        FileList,
        Option<Readonly<File[]>>,
        Option<Readonly<File[]>>
      >(
        () => none,
        (files: FileList) => {
          return some(
            Object.freeze(
              Array.from(Array(files.length).keys()).reduce(
                (list: File[], fileidx: number) => {
                  const file = files.item(fileidx);
                  if (file) {
                    return list.concat(file);
                  }
                  return list;
                },
                [] as File[]
              )
            )
          );
        }
      )(fromNullable($target.files));
    }
    case HTML_FORM_FIELD_TAG.INPUT_DATE:
    case HTML_FORM_FIELD_TAG.INPUT_DATETIME_LOCAL:
    case HTML_FORM_FIELD_TAG.INPUT_TIME:
    case HTML_FORM_FIELD_TAG.INPUT_WEEK: {
      return fromNaN($target.valueAsNumber);
    }
    case HTML_FORM_FIELD_TAG.INPUT_MONTH: {
      try {
        return some(new Date(`${$target.value}-1`).getTime());
      } catch (error) {
        console.error(
          "[RxFormData] Failed to decode month input field value into number",
          error
        );
        return none;
      }
    }
    case HTML_FORM_FIELD_TAG.INPUT_RADIO:
    case HTML_FORM_FIELD_TAG.INPUT_CHECKBOX: {
      const fieldtype = fieldtag.split(":")[1];
      const $form = fromNullable($target.form);
      if (isNone($form)) return none;

      const $checked = $form.value.querySelectorAll(
        `input[type='${fieldtype}'][name='${$target.name}']:checked`
      );

      return some(
        Object.freeze(
          Array.from($checked).map(($node, idx) => {
            return isInputFieldElement($node) && isNonEmptyString($node.value)
              ? $node.value.trim()
              : `${$target.name}[${idx}]`;
          })
        )
      );
    }
    default: {
      return none;
    }
  }
}

export function getSelectFieldValue(
  $target: unknown
): Option<HTMLFormFieldValue> {
  if (!isSelectFieldElement($target)) return none;
  const fieldtag = `${$target.tagName.toLowerCase()}:${
    $target.type
  }` as HTMLFormFieldTag;

  switch (fieldtag) {
    case HTML_FORM_FIELD_TAG.SELECT_SINGLE:
    case HTML_FORM_FIELD_TAG.SELECT_MULTIPLE: {
      return some(
        Object.freeze(
          Array.from(
            $target.selectedOptions
          ).map((opt: HTMLOptionElement, idx: number) =>
            isNonEmptyString(opt.value)
              ? opt.value.trim()
              : `${$target.name}[${idx}]`
          )
        )
      );
    }
    default: {
      return none;
    }
  }
}

export function getTextareaFieldValue(
  $target: unknown
): Option<HTMLFormFieldValue> {
  if (!isTextareaFieldElement($target)) return none;
  return some($target.value.trim());
}

export function getFormFieldValue(
  $target: unknown
): Option<HTMLFormFieldValue> {
  if (!isFormFieldElement($target)) return none;
  if (isInputFieldElement($target)) return getInputFieldValue($target);
  if (isSelectFieldElement($target)) return getSelectFieldValue($target);
  if (isTextareaFieldElement($target)) return getTextareaFieldValue($target);
  return none;
}

export function isFormFieldElementActive($target: unknown): boolean {
  if (isFormFieldElement($target)) {
    const $active = fromNullable(document.activeElement);
    if (isNone($active)) return false;
    if (!isFormFieldElement($active.value)) return false;
    return $target.isSameNode($active.value);
  }

  return false;
}

export function isFormFieldValue(x: unknown): x is HTMLFormFieldValue {
  if (isString(x)) return true;
  if (typeof x === "number") return true;
  if (Array.isArray(x)) {
    if (x.every(isString) || x.every((f: unknown) => f instanceof File))
      return true;
  }
  return false;
}

export function isFormFieldInternalTag(x: unknown): x is HTMLFormFieldTag {
  return isNonEmptyString(x) && Object.keys(HTML_FORM_FIELD_TAG).includes(x);
}

export function isFormFieldSelectorExpression(
  x: unknown
): x is FormFieldSelectorExpression {
  if (isString(x)) {
    return isNonEmptyString(x.trim());
  }
  return isRegExp(x);
}
