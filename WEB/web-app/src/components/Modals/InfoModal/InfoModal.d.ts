import React from "react";
interface InfoModalProps {
    show: boolean;
    onHide: () => void;
    data: Record<string, unknown>;
    labelMap: Record<string, string>;
    title?: string;
    dateKeys?: string[];
}
/**
 * Componente modal reutilizable para mostrar información detallada de un objeto.
 */
export declare const InfoModal: React.FC<InfoModalProps>;
export {};
