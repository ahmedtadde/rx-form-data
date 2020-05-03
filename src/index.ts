import { $getform } from "@operators/dom";
import { isNone } from "@datatypes/Option";
import { panic } from "@operators/error";
import {
  initialize as repositoryInitialization,
  FormFieldSelectorExpression
} from "@/repository";
import { initialize as eventsInitialization } from "@/events";
import {
  SubmissionHandlerConfigOption,
  ProgramInterfaceActionFn,
  ProgramInterfaceActionType,
  FormFieldSubscriber
} from "@datatypes/base";
import {
  PROGRAM_INTERFACE_ACTION_TYPE,
  FORM_FIELDS_SUBSCRIBERS_ACTION_TYPE,
  FORM_FIELD_STORAGE_ACTION_TYPE
} from "@/constants";
import { isNonEmptyString, isRegExp } from "@operators/string";

export default function RxFormData(
  formid: string,
  handler: SubmissionHandlerConfigOption
): Readonly<{
  ACTION_TYPE: Readonly<typeof PROGRAM_INTERFACE_ACTION_TYPE>;
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
      register: Object.freeze(
        (selection: FormFieldSelectorExpression[]): (() => void) => {
          repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.REGISTER, selection);
          return Object.freeze((): void => {
            repository.action(
              FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER,
              selection
            );
          });
        }
      ),
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
              const selection = Array.isArray(payload)
                ? payload.reduce(
                    (
                      expressions: FormFieldSelectorExpression[],
                      item: unknown
                    ) => {
                      if (isNonEmptyString(item) || isRegExp(item)) {
                        return expressions.concat(item);
                      }
                      return expressions;
                    },
                    [] as FormFieldSelectorExpression[]
                  )
                : [];

              selection.length &&
                repository.action(
                  FORM_FIELD_STORAGE_ACTION_TYPE.REGISTER,
                  selection
                );
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.UNREGISTER_ALL: {
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER_ALL);
              const keepvalues = payload !== false;
              !keepvalues &&
                repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.RESET);
              break;
            }

            case PROGRAM_INTERFACE_ACTION_TYPE.UNREGISTER: {
              const selection = Array.isArray(payload)
                ? payload.reduce(
                    (
                      expressions: FormFieldSelectorExpression[],
                      item: unknown
                    ) => {
                      if (isNonEmptyString(item) || isRegExp(item)) {
                        return expressions.concat(item);
                      }
                      return expressions;
                    },
                    [] as FormFieldSelectorExpression[]
                  )
                : [];

              selection.length &&
                repository.action(
                  FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER,
                  selection
                );
              break;
            }
            case PROGRAM_INTERFACE_ACTION_TYPE.DESTROY: {
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.RESET);
              repository.action(FORM_FIELD_STORAGE_ACTION_TYPE.UNREGISTER_ALL);
              if (events.cleanup) {
                events.cleanup();
              }
              break;
            }
            default: {
              console.debug(
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
