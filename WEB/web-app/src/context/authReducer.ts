import { types } from '@/types/types';
import { DTO_Usuario } from '@/models/DTO_Usuario';

export interface AuthState {
    user: DTO_Usuario | null;
    token: string | null;
    isAuthenticated: boolean;
}

type AuthAction =
    | { type: typeof types.login; payload: AuthState }
    | { type: typeof types.logout };

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case types.login: {
            const { user, token } = (action as { type: typeof types.login; payload: { user: DTO_Usuario; token: string } }).payload;
            return {
                ...state,
                user,
                token,
                isAuthenticated: true,
            };
        }

        case types.logout:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
            };

        default:
            return state;
    }
};