import { DTO_ItemOrdenServicio, DTO_OrdenServicio } from "@/models";
interface Props {
    orden: DTO_OrdenServicio;
    items: DTO_ItemOrdenServicio[];
    onClickCreateCount?: (countSelected: DTO_OrdenServicio) => void;
    onAvanceChange: (item: DTO_ItemOrdenServicio, checked: boolean) => void;
    onEstadoChange: (orden: DTO_OrdenServicio, nuevoEstado: number) => void;
}
export declare const OrdenServicioCard: ({ orden, items, onAvanceChange, onEstadoChange, onClickCreateCount, }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
