import { $getform, isFormFieldSelectorExpression } from "@operators/dom";
import { isNone, isSome } from "@datatypes/Option";
import { panic } from "@operators/error";
import { initialize as repositoryInitialization } from "@/repository";
import { initialize as eventsInitialization } from "@/events";
import {
  SubmissionHandlerConfigOption,
  ProgramInterfaceActionFn,
  ProgramInterfaceActionType,
  FormFieldSubscriber,
  FormFieldSelectorExpression
} from "@datatypes/base";
import {
  PROGRAM_INTERFACE_ACTION_TYPE,
  FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE,
  FORM_FIELD_STORAGE_ACTION_TYPE
} from "@/constants";
import { create as createDecoder, Decoder } from "@datatypes/Decoder";
import { isPlainObject } from "./operators/struct";

export default function RxFormData(
  formid: string,
  handler: SubmissionHandlerConfigOption
): Readonly<{
  ACTION_TYPE: Readonly<typeof PROGRAM_INTERFACE_ACTION_TYPE>;
  register: (
    selection: FormFieldSelectorExpression[]
  ) => (keepvalues: boolean) => void;
  subscribe: Readonly<(subscriber: FormFieldSubscriber) => () => void>;
  dispatch: Readonly<ProgramInterfaceActionFn>;
}> | void {
  const $target = $getform(formid);
  if (isNone($target)) {
    panic(
      "Invalid form element. Form id provided did not match any form element in the DOM."
    );
    return;
  }

  const repository = repositoryInitialization($target) || null;
  const events = repository
    ? eventsInitialization($target, handler, repository)
    : null;
  if (repository && events) {
    return Object.freeze({
      ACTION_TYPE: Object.freeze(PROGRAM_INTERFACE_ACTION_TYPE),
      register: Object.freeze((selection: FormFieldSelectorExpression[]): ((
        keepvalues: boolean
      ) => void) => {
        repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.REGISTER, selection);
        return Object.freeze((keepvalues: boolean): void => {
          repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER, {
            use: selection,
            keepvalues: keepvalues === true
          });
        });
      }),
      subscribe: Object.freeze((subscriber: FormFieldSubscriber) => {
        events.action(FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE.ADD, subscriber);
        return Object.freeze((): void => {
          events.action(FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE.DELETE, subscriber);
        });
      }),
      dispatch: Object.freeze(
        (type: ProgramInterfaceActionType, payload?: unknown): void => {
          switch (type) {
            case PROGRAM_INTERFACE_ACTION_TYPE.REGISTER_ALL: {
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.REGISTER_ALL);
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.REGISTER: {
              if (Array.isArray(payload)) {
                const selection = payload.filter(isFormFieldSelectorExpression);
                selection.length &&
                  repository.action(
                    FORM_FIELD_STORAGE_ACTION_TYPE.REGISTER,
                    selection
                  );
              }
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.UNREGISTER_ALL: {
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER_ALL);
              const keepvalues = payload === true;
              !keepvalues &&
                repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.RESET);
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.UNREGISTER: {
              if (Array.isArray(payload)) {
                const selection = payload.filter(isFormFieldSelectorExpression);
                selection.length &&
                  repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER, {
                    use: selection,
                    keepvalues: false
                  });
              } else if (isPlainObject(payload)) {
                const keepvalues = payload.keepvalues === true;
                const selection = Array.isArray(payload.use)
                  ? payload.use.filter(isFormFieldSelectorExpression)
                  : [];
                selection.length &&
                  repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER, {
                    use: selection,
                    keepvalues
                  });
              }
              break;
            }
            case PROGRAM_INTERFACE_ACTION_TYPE.DESTROY: {
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.RESET);
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER_ALL);
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.CLEAR_DECODERS);
              if (events.cleanup) {
                events.cleanup();
              }
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.ADD_DECODERS: {
              if (Array.isArray(payload)) {
                const params = payload.reduce(
                  (decoders: Decoder[], config: unknown) => {
                    const decoder = createDecoder(config);
                    if (isSome(decoder)) return decoders.concat(decoder.value);
                    return decoders;
                  },
                  [] as Decoder[]
                );
                if (params.length)
                  repository.action(
                    FORM_FIELD_STORAGE_ACTION_TYPE.UPSERT_DECODER,
                    params
                  );
              }
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.REMOVE_DECODERS: {
              if (Array.isArray(payload)) {
                repository.action(
                  FORM_FIELD_STORAGE_ACTION_TYPE.REMOVE_DECODER,
                  payload.filter(isFormFieldSelectorExpression)
                );
              }
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.CLEAR_DECODERS: {
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.CLEAR_DECODERS);
              break;
            }

            default: {
              console.info(
                `[RxFormData: #${formid}] uknown action dispatched...`,
                payload
              );
              return;
            }
          }
        }
      )
    });
  }

  return;
}
