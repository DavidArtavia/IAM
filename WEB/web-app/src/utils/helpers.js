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
export function updateItemById(list, updatedItem, idKey) {
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
