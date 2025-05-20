// useUsuario.ts
import { useState } from "react";
import { DTO_Usuario } from "@/models";

const defaultUsuario: DTO_Usuario = new DTO_Usuario();

export function useUsuarioContext(
  initial: Partial<DTO_Usuario> = {}
): readonly [DTO_Usuario, (patch: Partial<DTO_Usuario>) => void] {
  const [usuario, setUsuario] = useState<DTO_Usuario>({
    ...defaultUsuario,
    ...initial,
  });

  const update = (patch: Partial<DTO_Usuario>) =>
    setUsuario((u) => ({ ...u, ...patch }));

  return [usuario, update] as const;
}
