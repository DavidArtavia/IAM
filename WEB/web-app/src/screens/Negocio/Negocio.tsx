import { NegociosTable } from "@/components/Tables/NegociosTable/NegociosTable";
import { DTO_Negocio, DTO_Respuesta } from "@/models";
import { chatService } from "@/services";
import { errorHelpers, procesarRespuesta } from "@/utils";
import { useEffect, useState } from "react";

export const Negocio = () => {
    // === Estados principales ===
    const [business, setBusiness] = useState<Array<DTO_Negocio>>([]);
    const [disableButtonAdd, setDisableButtonAdd] = useState<boolean>(false);
  
   useEffect(() => {
          chatService.obtenerNegocios().subscribe({
            next: (result) =>
              setBusiness(
                procesarRespuesta(result as DTO_Respuesta) as Array<DTO_Negocio>
              ),
            error: (err) => errorHelpers.serverError(err), //controlamos el error del servidor
            complete: () => {},
          });
      }, []);

  return (
   
       <>
         <div className="row p-4 col-12 gx-0">
           <NegociosTable
           data={business}
           onAdd={() => {}}
           onEdit={() => {}}
           onDelete={() => {}}
           disableButtonAdd={disableButtonAdd}
           />
         </div>
       </>
  );
};

