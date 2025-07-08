/**
 * Actualiza un elemento en la lista si existe, comparando por la clave idKey.
 * Si no existe, agrega el elemento actualizado al final de la lista.
 *
 * @param list - Lista original de elementos.
 * @param updatedItem - Elemento actualizado a insertar o reemplazar.
 * @param idKey - Clave que identifica de forma única a cada elemento.
 * @returns Una nueva lista con el elemento actualizado o agregado.
 */
export declare function updateItemById<T>(list: T[], updatedItem: T, idKey: keyof T): T[];
