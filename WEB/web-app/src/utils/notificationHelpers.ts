export class notificationHelpers {

    constructor() {
        // @ts-expect-error — Se importa en el index al ser una funcionabilidad ya integrada de la plantilla
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "400",
            "hideDuration": "2000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };
        
    }

    static errorAlert(mensaje: string) {
        // @ts-expect-error - Función nativa
        toastr.error(mensaje, "Error");
    }
        static infoAlert(mensaje: string) {
        // @ts-expect-error - Función nativa
        toastr.info(mensaje, "Información");
    }
        static warningAlert(mensaje: string) {
        // @ts-expect-error - Función nativa
        toastr.warning(mensaje, "Advertencia");
    }
        static successAlert(mensaje: string) {
        // @ts-expect-error - Función nativa
        toastr.success(mensaje, "Correcto");
    }

}