import { SubmissionHandlerConfigOption, ProgramInterfaceActionFn, FormFieldSubscriber, FormFieldSelectorExpression } from "./datatypes/base";
import { PROGRAM_INTERFACE_ACTION_TYPE } from "./constants";
export default function RxFormData(formid: string, handler: SubmissionHandlerConfigOption): Readonly<{
    ACTION_TYPE: Readonly<typeof PROGRAM_INTERFACE_ACTION_TYPE>;
    register: (selection: FormFieldSelectorExpression[]) => (keepvalues: boolean) => void;
    subscribe: Readonly<(subscriber: FormFieldSubscriber) => () => void>;
    dispatch: Readonly<ProgramInterfaceActionFn>;
}> | void;
