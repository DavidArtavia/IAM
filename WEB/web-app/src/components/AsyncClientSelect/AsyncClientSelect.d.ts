export interface ClientOption {
    value: number;
    label: string;
}
interface Props {
    value: ClientOption | null;
    onChange: (opt: ClientOption | null) => void;
}
export declare const AsyncClientSelect: ({ value, onChange }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
