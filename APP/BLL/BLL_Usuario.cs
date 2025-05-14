using DAL;
using DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UTL;

namespace BLL
{
    public class BLL_Usuario
    {
        UTL_Cipher uTL_Cipher = new UTL_Cipher();
        DAL_Usuario dal_Usuario = new DAL_Usuario();
        DAL_Alerta dAL_Alerta = new DAL_Alerta();
        public DTO_Respuesta registrarUsuario(DTO_Usuario usuario)
        {
            usuario.Pass = uTL_Cipher.encriptar(usuario.Pass);
            return dal_Usuario.registrarUsuario(usuario);
        }

        public DTO_Respuesta autenticarUsuario(DTO_Usuario usuarioEnviado)
        {
            
            DTO_Respuesta respuesta = new DTO_Respuesta();
            DTO_Usuario usuarioObtenido = new DTO_Usuario();

            //usamos el metodo para obtener el usuario con intención de autenticar (Ya trae un mensaje listo en caso de que pase la validación)
            respuesta = dal_Usuario.obtenerUsuario(usuarioEnviado);

            //verificamos si hasta el momento ha cido satisfactoria el proceso de autenticación
            if (respuesta.TipoRespuesta) 
            {
                //Guardamos el usuario obtenido en una variable nueva para mayor entendimiento
                usuarioObtenido = (DTO_Usuario)respuesta.Resultado[0];

                //Des encriptamos la contraseña
                usuarioObtenido.Pass = uTL_Cipher.desEncriptar(usuarioObtenido.Pass);

                //La famosa validación
                if (usuarioEnviado.Pass == usuarioObtenido.Pass)
                {
                    //preparamos el objeto de respuesta para que se valla sin el pass
                    usuarioObtenido.Pass = String.Empty;
                    respuesta = dAL_Alerta.obtenerAlerta("A004");
                    respuesta.Resultado.Add(usuarioObtenido);
                }
                else
                {
                    //Si no coincide le mostramos el mensaje personalizado de la base de datos
                    respuesta = dAL_Alerta.obtenerAlerta("A006");

                }

            }

            return respuesta;
        }

        public DTO_Respuesta obtenerUsuarioPorId(DTO_Usuario usuario)
        {
            return dal_Usuario.obtenerUsuarioPorId(usuario);
        }
    }
}
