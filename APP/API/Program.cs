using Azure;
using BLL;
using BLL.Hubs;
using DTO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using UTL;

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
            ClockSkew = TimeSpan.Zero,
            ValidIssuer = System.Configuration.ConfigurationManager.AppSettings["JwtIssuer"],
            ValidAudience = System.Configuration.ConfigurationManager.AppSettings["JwtAudience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(System.Configuration.ConfigurationManager.AppSettings["JwtKey"] ?? ""))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // ✅ Para SignalR: permitir token por query string
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub/monitorOSHub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },

            OnAuthenticationFailed = context =>
            {
                UTL_Cipher uTL_Cipher = new UTL_Cipher();
                BLL_Usuario bLL_Usuario = new BLL_Usuario();
                BLL_Sesion bLL_Sesion = new BLL_Sesion();

                DTO_Usuario usuario = new DTO_Usuario();
                DTO_Sesion sesion = new DTO_Sesion();
                DTO_Respuesta respuesta = new DTO_Respuesta();

                if (context.Exception is SecurityTokenExpiredException)
                {
                    if (context.HttpContext.Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
                    {
                        var authHeader = context.Request.Headers["Authorization"].ToString();
                        var token = authHeader.StartsWith("Bearer ") ? authHeader.Substring(7) : authHeader;

                        var handler = new JwtSecurityTokenHandler();
                        var jwtToken = handler.ReadJwtToken(token);

                        var userId = jwtToken.Claims.FirstOrDefault(c =>
                            c.Type == ClaimTypes.NameIdentifier || c.Type == "id")?.Value;

                        sesion.RefreshToken = refreshToken;
                        sesion.ID_Usuario = Convert.ToInt32(userId);

                        respuesta = bLL_Sesion.validarRefreshToken(sesion);

                        if (respuesta.TipoRespuesta)
                        {
                            sesion = (DTO_Sesion)respuesta.Resultado[0];

                            var cookieOptions = uTL_Cipher.cookieOptions();
                            context.Response.Cookies.Append("refreshToken", sesion.RefreshToken, cookieOptions);

                            usuario.ID_Usuario = sesion.ID_Usuario;
                            usuario = (DTO_Usuario)bLL_Usuario.obtenerUsuarioPorId(usuario).Resultado[0];

                            string accesToken = uTL_Cipher.generarAccessToken(usuario);

                            respuesta.Resultado.Clear();
                            respuesta.Resultado.Add(new { accesToken = accesToken });

                            context.Response.StatusCode = 403;
                            context.Response.ContentType = "application/json";
                            var result = JsonSerializer.Serialize(respuesta);
                            return context.Response.WriteAsync(result);
                        }
                        else
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
builder.Services.AddSingleton<IUserIdProvider, EmailUserIdProvider>();

builder.Services.AddSwaggerGen(options =>
{
    // Definir el tipo de contenido para archivos binarios (para permitir cargar archivos con Swagger)
    options.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });
});

//SiganlR Notificador
builder.Services.AddScoped<BLL_Notificador>();
builder.Services.AddScoped<BLL_ChatIA>();

// ✅ CORS configuration => CORS significa Cross-Origin Resource Sharing ("compartición de recursos entre orígenes cruzados").
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendDev", policy =>
       policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:8080")
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials());
});

builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.MapHub<MonitorOSHub>("/hub/monitorOSHub");


app.UseCors("AllowFrontendDev");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseCookiePolicy();
app.MapControllers();
app.Run();
