export class DTO_Sesion {
    // Inicializamos valores por defecto
    ID_Sesion: number = 0;
    ID_Usuario: number = 0;
    RefreshToken: string = '';
    FechaCreacion: Date = new Date();
    FechaExpiracion: Date = new Date();
    Revocado: boolean = false;
    FechaRevocado: Date | null = null;
    ReemplazadoPorToken: string = '';
    UserAgent: string = '';
    IPUsuario: string = '';
}