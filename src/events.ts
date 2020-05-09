import { FormFieldStorage, FormDecoders } from "@/repository";
import {
  FormField,
  fromFormEvent,
  SerializedFormField,
  serialize
} from "@datatypes/Field";
import {
  FormFieldStorageActionFn,
  FormFieldStorageInterface,
  FormFieldSubscriber,
  FormEventsInterface,
  FormFieldsSubscribersActionType,
  SubmissionHandlerConfigOption
} from "@datatypes/base";

import { Option, isNone } from "@datatypes/Option";
import {
  FORM_FIELD_STORAGE_ACTION_TYPE,
  HTML_FORM_NATIVE_EVENT_TYPE,
  FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE,
  HTML_FORM_CUSTOM_EVENT_TYPE
} from "@/constants";
import { panic } from "@operators/error";

import { run as runDecoder, DecoderResult } from "@datatypes/Decoder";

export async function onsubmit<T>(
  $form: HTMLFormElement,
  storage: FormFieldStorage,
  decoders: FormDecoders,
  handler: <K extends T, U>(
    formvalues: Readonly<Record<string, SerializedFormField<U>>>,
    formvalidation: Error | Readonly<Record<string, Readonly<DecoderResult>>>,
    formdata: FormData
  ) => K
): Promise<T> {
  const formdata = new FormData($form);

  return new Promise((resolve, reject) => {
    Promise.resolve()
      .then(() => {
        const nilvalue = null;
        const formvalues = [...storage.entries()].reduce(
          (
            values: Record<string, SerializedFormField<typeof nilvalue>>,
            [fieldname, fielddata]
          ) => {
            values[fieldname] = serialize(fielddata, nilvalue);
            return values;
          },
          {} as Record<string, SerializedFormField<typeof nilvalue>>
        );

        return Promise.all([
          nilvalue,
          formvalues,
          Promise.all(
            Array.from(decoders.values()).map((decoder) =>
              runDecoder(decoder, formvalues)
            )
          )
        ]);
      })
      .then(([nil, formvalues, decoderResults]) => {
        const validation = decoderResults.reduce(
          (collection: Record<string, Readonly<DecoderResult>>, result) => {
            return Object.assign({}, collection, Object.freeze(result));
          },
          {} as Record<string, Readonly<DecoderResult>>
        );

        return Promise.resolve(
          handler<T, typeof nil>(
            Object.freeze(formvalues),
            Object.freeze(validation),
            formdata
          )
        );
      })
      .then(() => {
        console.info(
          `[RxFormData #${$form.id}] form submission handler success`
        );
        resolve();
      })
      .catch((err: unknown) => {
        console.error(
          `[RxFormData #${$form.id}] form submission handler error(s)`,
          err
        );
        reject(err);
      });
  });
}

export function onfieldevent(
  evt: Event,
  action: FormFieldStorageActionFn
): void {
  action(FORM_FIELD_STORAGE_ACTION_TYPE.UPSERT, fromFormEvent(evt));
}

export function getFormEventListener(
  $target: HTMLFormElement,
  submissionHanlder: SubmissionHandlerConfigOption,
  storageinterface: FormFieldStorageInterface,
  subscribersinterface: FormEventsInterface
) {
  return function listener(
    evt: Event | CustomEvent<Readonly<Map<string, FormField>>>
  ): void {
    if (evt instanceof CustomEvent) {
      switch (evt.type) {
        case HTML_FORM_CUSTOM_EVENT_TYPE.EMIT_FORM_VALUES: {
          const subscribers = subscribersinterface.subscribers();
          const nilvalue = null;
          const formvalues = Object.freeze(
            [...storageinterface.storage().entries()].reduce(
              (
                values: Record<string, SerializedFormField<typeof nilvalue>>,
                [fieldname, fielddata]
              ) => {
                values[fieldname] = serialize(fielddata, nilvalue);
                return values;
              },
              {} as Record<string, SerializedFormField<typeof nilvalue>>
            )
          );

          Promise.all(
            [...storageinterface.decoders().values()].map((decoder) =>
              runDecoder(decoder, formvalues)
            )
          )
            .then((decoderResults) => {
              const validation = decoderResults.reduce(
                (
                  collection: Record<string, Readonly<DecoderResult>>,
                  result
                ) => {
                  collection[result.decoder] = Object.freeze(result);
                  return collection;
                },
                {} as Record<string, Readonly<DecoderResult>>
              );

              for (const fn of subscribers) {
                fn(formvalues, Object.freeze(validation));
              }
            })
            .catch((err) => {
              const error = new Error(
                "[RxFormData] An an error occured while running decoders. Check the error details for more info."
              );
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              //@ts-ignore
              error.details = err;

              for (const fn of subscribers) {
                fn(formvalues, error);
              }
            });
          break;
        }
      }
    } else {
      switch (evt.type) {
        case HTML_FORM_NATIVE_EVENT_TYPE.SUBMIT: {
          evt.preventDefault();
          onsubmit<ReturnType<typeof submissionHanlder>>(
            $target,
            storageinterface.storage(),
            storageinterface.decoders(),
            submissionHanlder
          );
          break;
        }
        case HTML_FORM_NATIVE_EVENT_TYPE.FOCUS:
        case HTML_FORM_NATIVE_EVENT_TYPE.INPUT:
        case HTML_FORM_NATIVE_EVENT_TYPE.CHANGE:
        case HTML_FORM_NATIVE_EVENT_TYPE.BLUR: {
          onfieldevent(evt, storageinterface.action);
          break;
        }
        case HTML_FORM_NATIVE_EVENT_TYPE.RESET: {
          storageinterface.action(FORM_FIELD_STORAGE_ACTION_TYPE.RESET);
          break;
        }
      }
    }
  };
}

export function initialize(
  $formElement: Option<HTMLFormElement>,
  submissionHanlder: SubmissionHandlerConfigOption,
  storageinterface: FormFieldStorageInterface
): FormEventsInterface | void {
  const subscribers = new Set<FormFieldSubscriber>();
  if (isNone($formElement)) {
    panic("[RxFormData] invalid form element for events initialization");
    return;
  }

  const subscribersref = new Map<
    Set<FormFieldSubscriber>,
    Set<FormFieldSubscriber>
  >();

  subscribersref.set(
    subscribers,
    new Set<FormFieldSubscriber>(subscribers.values())
  );

  const getsubscribers = (): Set<FormFieldSubscriber> => {
    const latest = subscribersref.get(subscribers);
    return latest ? latest : new Set<FormFieldSubscriber>();
  };

  const action = (
    type: FormFieldsSubscribersActionType,
    payload?: FormFieldSubscriber
  ): void => {
    switch (type) {
      case FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE.ADD: {
        if (payload instanceof Function) {
          subscribersref.set(
            subscribers,
            new Set<FormFieldSubscriber>(getsubscribers().values()).add(payload)
          );
        }
        break;
      }
      case FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE.DELETE: {
        if (payload instanceof Function) {
          const newset = new Set<FormFieldSubscriber>(
            getsubscribers().values()
          );
          newset.delete(payload);
          subscribersref.set(subscribers, newset);
        }
        break;
      }
      case FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE.CLEAR: {
        subscribersref.set(subscribers, new Set<FormFieldSubscriber>());
        break;
      }
    }
  };

  const interfaceobj = {
    subscribers: getsubscribers,
    action
  };

  const $target = $formElement.value;
  const listener = getFormEventListener(
    $target,
    submissionHanlder,
    storageinterface,
    interfaceobj
  );

  [
    ...Object.values(HTML_FORM_NATIVE_EVENT_TYPE),
    ...Object.values(HTML_FORM_CUSTOM_EVENT_TYPE)
  ].forEach((eventtype) => {
    $target.addEventListener(eventtype, listener, true);
    // const isInputEvent = HTML_FORM_NATIVE_EVENT_TYPE.INPUT === eventtype;
    // if (!isInputEvent) {
    //   $target.addEventListener(eventtype, listener, true);
    // }
  });

  return {
    ...interfaceobj,
    cleanup: (): void => {
      [
        ...Object.values(HTML_FORM_NATIVE_EVENT_TYPE),
        ...Object.values(HTML_FORM_CUSTOM_EVENT_TYPE)
      ].forEach((eventtype) => {
        $target.removeEventListener(eventtype, listener, true);
      });
      action(FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE.CLEAR);
      storageinterface.action(FORM_FIELD_STORAGE_ACTION_TYPE.CLEAR);
    }
  };
}
