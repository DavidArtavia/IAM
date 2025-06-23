using DTO;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace UTL
{
    public  class UTL_SesionHelper
    {
        /// <summary>
        /// Crea un DTO_Usuario a partir de la colección de claims.
        /// Lanza <see cref="UnauthorizedAccessException"/> si los claims obligatorios no existen.
        /// </summary>
        public static DTO_Usuario obtenerUsuarioSesion(IEnumerable<Claim> claims)
        {
            DTO_Usuario usuario = new();
            if (claims == null)
                throw new ArgumentNullException(nameof(claims));


            string idValue = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            string emailValue = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrWhiteSpace(idValue))
                throw new UnauthorizedAccessException("User ID claim is missing.");

            if (string.IsNullOrWhiteSpace(emailValue))
                throw new UnauthorizedAccessException("User Email claim is missing.");



            return new DTO_Usuario
            {
                ID_Usuario = int.Parse(idValue),
                CorreoUsuario = emailValue
            };
        }
    }
}
