using BLL;
using DTO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = System.Configuration.ConfigurationManager.AppSettings["JwtIssuer"],
            ValidAudience = System.Configuration.ConfigurationManager.AppSettings["JwtAudience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(System.Configuration.ConfigurationManager.AppSettings["JwtKey"] ?? ""))
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                DTO_Respuesta respuesta = new DTO_Respuesta();

                if (context.Exception is SecurityTokenExpiredException)
                {
                    if (context.HttpContext.Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
                    {
                        DTO_Sesion sesion = new DTO_Sesion();
                        var authHeader = context.Request.Headers["Authorization"].ToString();
                        var token = authHeader.StartsWith("Bearer ") ? authHeader.Substring(7) : authHeader;

                        // Decodificar token sin validar (solo para leer claims)
                        var handler = new JwtSecurityTokenHandler();
                        var jwtToken = handler.ReadJwtToken(token);

                        // Extraer userId
                        var userId = jwtToken.Claims.FirstOrDefault(c =>
                            c.Type == ClaimTypes.NameIdentifier || c.Type == "id")?.Value;


                        //asigmanos los valores a la sesión
                        sesion.RefreshToken = refreshToken;
                        sesion.ID_Usuario = Convert.ToInt32(userId);

                        //Aqui mandamos a validar el refreshToken y si es válido entonces creamos un nuevo acces token
                        BLL_Sesion bLL_Sesion = new BLL_Sesion();
                        respuesta = bLL_Sesion.validarRefreshToken(sesion);

                        //Validamos si todo bien con el token y solo debe reintentar o si es un 401 definitivo que lo lleva al login
                        if (respuesta.TipoRespuesta)
                        {
                            //403
                            context.Response.StatusCode = 403;
                            context.Response.ContentType = "application/json";
                            var result = JsonSerializer.Serialize(respuesta);
                            return context.Response.WriteAsync(result);
                        }
                        else
                        {
                            context.Response.StatusCode = 403;
                            context.Response.ContentType = "application/json";
                            var result = JsonSerializer.Serialize(new DTO_Respuesta
                            {
                                Codigo = "401",
                                Mensaje = "La sesión no es válida, Por favor, inicie sesión nuevamente.",
                                TipoRespuesta = false
                            });
                            return context.Response.WriteAsync(result);
                        }

                    }

                   
                }

                if (context.Exception is SecurityTokenSignatureKeyNotFoundException)
                {
                    context.Response.StatusCode = 401;
                    context.Response.ContentType = "application/json";
                    var result = JsonSerializer.Serialize(new DTO_Respuesta
                    {
                        Codigo = "401",
                        Mensaje = "La sesión no es válida, Por favor, inicie sesión nuevamente.",
                        TipoRespuesta = false
                    });
                    return context.Response.WriteAsync(result);
                }

                return Task.CompletedTask;
            }
        };

    });

// Personalizar respuestas de error


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    // Definir el tipo de contenido para archivos binarios (para permitir cargar archivos con Swagger)
    options.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });
});


// ✅ CORS configuration => CORS significa Cross-Origin Resource Sharing ("compartición de recursos entre orígenes cruzados").
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendDev", policy =>
       policy.WithOrigins("http://localhost:5173")
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontendDev");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseCookiePolicy();
app.MapControllers();
app.Run();
