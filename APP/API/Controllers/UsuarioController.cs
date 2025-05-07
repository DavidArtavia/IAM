using DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        // GET: api/<UsuarioController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }


        //[AllowAnonymous]
        //[EnableCors("Todos")]
        [Produces("application/json")]
        [Route("registrarUsuario")]
        [HttpPost]
        public void Post([FromBody] DTO_Usuario usuario)
        {

        }


    }
}
