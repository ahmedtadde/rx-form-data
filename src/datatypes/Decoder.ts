import { FormFieldSelectorExpression } from "@datatypes/base";
import { SerializedFormField } from "@datatypes/Field";
import { isPlainObject } from "@/operators/struct";
import { Option, none, some, isNone, isSome } from "@datatypes/Option";
import { isNonEmptyString, isString, isRegExp } from "@/operators/string";
import { isFormFieldSelectorExpression } from "@/operators/dom";

export type DecoderResolver = <T, K>(
  inputs: Readonly<Record<string, SerializedFormField<T>>>
) => boolean | K;

export type DecoderErrorsGenerator = (
  context: Record<string, unknown>
) => string | string[];

export interface Decoder {
  name: string;
  input: FormFieldSelectorExpression[];
  use: DecoderResolver[];
  messages: DecoderErrorsGenerator;
}

export interface DecoderResult {
  decoder: string;
  success: boolean;
  errors: string[];
}

export function create(config: unknown): Option<Decoder> {
  if (!isPlainObject(config)) return none;
  if (!isNonEmptyString(config.name)) return none;

  if (
    !isFormFieldSelectorExpression(config.input) &&
    !Array.isArray(config.input)
  )
    return none;

  if (
    Array.isArray(config.input) &&
    !config.input.every(isFormFieldSelectorExpression)
  )
    return none;

  if (!Array.isArray(config.use)) return none;

  if (!config.use.every((fn) => fn instanceof Function)) return none;

  const hasMessage =
    (Array.isArray(config.messages) &&
      config.messages.every(isNonEmptyString)) ||
    config.messages instanceof Function;

  if (!hasMessage) return none;

  const name = config.name.trim();
  const input = isFormFieldSelectorExpression(config.input)
    ? ([config.input] as FormFieldSelectorExpression[])
    : (config.input as FormFieldSelectorExpression[]);

  const use = config.use as DecoderResolver[];

  const messages = Array.isArray(config.messages)
    ? (): string | string[] => config.messages as string[]
    : (config.messages as DecoderErrorsGenerator);

  return some({ name, input, use, messages });
}

export function isDecoder(x: unknown): x is Decoder {
  const decoder = create(x);
  return isSome(decoder);
}

export function getinputs<T>(
  decoder: Decoder,
  formvalues: Readonly<Record<string, SerializedFormField<T>>>
): Readonly<Record<string, SerializedFormField<T>>> {
  return Object.freeze(
    Object.entries(formvalues).reduce(
      (
        inputs: Readonly<Record<string, SerializedFormField<T>>>,
        [key, value]
      ) => {
        const match = decoder.input.some((expression) => {
          if (isNonEmptyString(expression)) return expression.trim() === key;
          if (isRegExp(expression)) return expression.test(key);
          return false;
        });

        if (match && !Object.keys(inputs).includes(key)) {
          return Object.assign(inputs, { [key]: value });
        }
        return inputs;
      },
      {} as Readonly<Record<string, SerializedFormField<T>>>
    )
  );
}

export async function run<K>(
  decoder: Decoder,
  formvalues: Readonly<Record<string, SerializedFormField<K>>>
): Promise<DecoderResult> {
  return new Promise((resolve) => {
    Promise.resolve(getinputs<K>(decoder, formvalues))
      .then((inputs) => {
        return Promise.all([
          inputs,
          ...decoder.use.map((resolver) =>
            resolver<K, ReturnType<typeof resolver>>(inputs)
          )
        ]);
      })
      .then(([inputs, ...results]) => {
        if (results.every((result) => result === true))
          return Promise.resolve([]);

        return Promise.resolve(decoder.messages({ inputs, outputs: results }));
      })
      .then((errors) => {
        if (Array.isArray(errors)) {
          errors.length
            ? resolve({
                decoder: decoder.name,
                success: false,
                errors: errors.filter(isNonEmptyString)
              })
            : resolve({
                decoder: decoder.name,
                success: true,
                errors: []
              });

          return;
        }

        if (isNonEmptyString(errors)) {
          resolve({
            decoder: decoder.name,
            success: false,
            errors: [errors]
          });
          return;
        }

        resolve({
          decoder: decoder.name,
          success: false,
          errors: [`Decoder error(s): ${JSON.stringify(errors)}`]
        });
      })
      .catch((err: unknown) => {
        console.error(
          "[RxFormData] An error occured while running decoder resolvers",
          decoder,
          err
        );

        resolve({
          decoder: decoder.name,
          success: false,
          errors: ["Decoder implementation error(s)"]
        });
      });
  });
}
