//#region updateItemById: Actualiza o agrega un elemento en una lista por su id
/**
 * Actualiza un elemento en la lista si existe, comparando por la clave idKey.
 * Si no existe, agrega el elemento actualizado al final de la lista.
 * 
 * @param list - Lista original de elementos.
 * @param updatedItem - Elemento actualizado a insertar o reemplazar.
 * @param idKey - Clave que identifica de forma única a cada elemento.
 * @returns Una nueva lista con el elemento actualizado o agregado.
 */
export function updateItemById<T>(list: T[], updatedItem: T, idKey: keyof T): T[] {
    const id = updatedItem[idKey];
    const index = list.findIndex(item => item[idKey] === id);
    if (index >= 0) {
        const newList = [...list];
        newList[index] = updatedItem;
        return newList;
    }
    return [...list, updatedItem];
}
//#endregion

//#region parametrosAString: Convierte una lista de parámetros a string legible
/**
 * Convierte una lista de objetos { nombre, valor } en un string legible.
 * Cada parámetro se capitaliza y se separa por coma.
 * 
 * @param lista - Lista de parámetros a convertir.
 * @returns String con los parámetros formateados.
 */
export function parametrosAString(
    lista?: { nombre: string; valor: string }[] | null
): string {
    if (!Array.isArray(lista) || lista.length === 0) return "";

    return lista
        .map(({ nombre = "", valor = "" }) => {
            const nom = nombre.trim();
            const val = valor.trim();
            const nomCap = nom
                ? nom[0].toUpperCase() + nom.slice(1).toLowerCase()
                : "";
            return `${nomCap}: ${val}`;
        })
        .join(", ");
}
//#endregion