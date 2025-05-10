using BLL;
using DAL;
using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech;
using UTL;
using System.Text;

namespace API.Controllers
{
    public class ChatIAController : Controller
    {
        

        [AllowAnonymous]
        [Produces("application/json")]
        [Route("chatIA")]
        [HttpPost]
         public async Task<DTO_Respuesta> chatIA([FromBody] DTO_Usuario usuario)
        {
            DTO_Respuesta respuesta = new DTO_Respuesta();
   
            try
            {
                await BLL_ChatIA.Transcribir();
            }
            catch (Exception ex)
            {

            }


            return respuesta;
        }

  


    }
}