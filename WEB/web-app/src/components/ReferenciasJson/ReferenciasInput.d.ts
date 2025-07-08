import { DTO_Param as DTO_ParamBase } from "@/models";
interface DTO_Param extends DTO_ParamBase {
    _nuevo?: boolean;
}
interface Props {
    value?: DTO_Param[];
    onChange: (val: DTO_Param[]) => void;
    hideCheckbox?: boolean;
    editable?: boolean;
}
export declare const ReferenciasJsonInput: ({ value, onChange, hideCheckbox, editable, }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
