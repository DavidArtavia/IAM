import { defer } from 'rxjs';
import { map } from 'rxjs';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/constants';
export class itemsOrdenesService {
    static obtenerItemsOrdensDeServicio(itemsOrden) {
        return defer(() => api.post(API_ENDPOINTS.ITEMS_ORDERS.GET_ORDERS, itemsOrden)).pipe(map((r) => r.data));
    }
    static registrarItemsOrdensDeServicio(itemsOrden) {
        return defer(() => api.post(API_ENDPOINTS.ITEMS_ORDERS.ADD_ORDER, itemsOrden)).pipe(map((r) => r.data));
    }
    static actualizarItemsOrdensDeServicio(itemsOrden) {
        return defer(() => api.post(API_ENDPOINTS.ITEMS_ORDERS.UPDATE_ORDER, itemsOrden)).pipe(map((r) => r.data));
    }
}
