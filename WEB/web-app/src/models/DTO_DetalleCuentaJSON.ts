import { DTO_Param } from "./DTO_Param";

export class DTO_DetalleCuentaJSON {
    filas: DTO_Param[] = [];
    descuento: DTO_Param = new DTO_Param();
    impuesto: DTO_Param = new DTO_Param();
}