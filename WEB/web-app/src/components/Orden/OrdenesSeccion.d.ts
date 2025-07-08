import { DTO_ItemOrdenServicio, DTO_OrdenServicio } from "@/models";
interface Props {
    titulo: string;
    colorBarra: string;
    estado: number;
    ordenes: DTO_OrdenServicio[];
    items: DTO_ItemOrdenServicio[];
    onAvanceChange: (item: DTO_ItemOrdenServicio, checked: boolean) => void;
    onEstadoChange: (orden: DTO_OrdenServicio, nuevoEstado: number) => void;
    onClickCreateCount?: (countSelected: DTO_OrdenServicio) => void;
}
export declare const OrdenesSeccion: ({ titulo, colorBarra, estado, ordenes, items, onAvanceChange, onEstadoChange, onClickCreateCount, }: Props) => import("react/jsx-runtime").JSX.Element;
export {};
