import { FormFieldSelectorExpression } from "./base";
import { SerializedFormField } from "./Field";
import { Option } from "./Option";
export declare type DecoderResolver = <T, K>(inputs: Readonly<Record<string, SerializedFormField<T>>>) => boolean | K;
export declare type DecoderErrorsGenerator = (context: Record<string, unknown>) => string | string[];
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
export declare function create(config: unknown): Option<Decoder>;
export declare function isDecoder(x: unknown): x is Decoder;
export declare function getinputs<T>(decoder: Decoder, formvalues: Readonly<Record<string, SerializedFormField<T>>>): Readonly<Record<string, SerializedFormField<T>>>;
export declare function run<K>(decoder: Decoder, formvalues: Readonly<Record<string, SerializedFormField<K>>>): Promise<DecoderResult>;
