import { DTO_Param } from "./DTO_Param";

export class DTO_DetalleCuentaJSON {
    filas: DTO_Param[] = [];
    descuento: DTO_Param = {nombre: 'Monto', valor: ''} as DTO_Param;
    impuesto: DTO_Param =  {nombre: 'Porcentaje', valor: ''} as DTO_Param;
}