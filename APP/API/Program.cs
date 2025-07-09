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
builder.Services.AddScoped<BLL_ItemOrdenServicio>();
builder.Services.AddScoped<BLL_OrdenServicio>();

// ✅ CORS configuration => CORS significa Cross-Origin Resource Sharing ("compartición de recursos entre orígenes cruzados").
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendDev", policy =>
       policy.WithOrigins(System.Configuration.ConfigurationManager.AppSettings["ClientURL"])
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials()
             .WithExposedHeaders("Content-Type", "Authorization", "Set-Cookie", "accesToken")); // <- clave);
});

builder.Services.AddSignalR();

var app = builder.Build();

// Middleware orden correcto

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontendDev");
app.Use(async (context, next) =>
{
    await next();

    if (context.Response.StatusCode == 401 &&
        context.Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
    {
        // Aquí puedes poner tu lógica de validación del refreshToken
        // por ejemplo:

        var bllSesion = new BLL_Sesion();
        var bllUsuario = new BLL_Usuario();
        var cipher = new UTL_Cipher();

        // Extraer el userId desde el JWT vencido si lo deseas (opcional)
        var authHeader = context.Request.Headers["Authorization"].ToString();
        var token = authHeader.StartsWith("Bearer ") ? authHeader.Substring(7) : null;

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var userId = jwtToken.Claims.FirstOrDefault(c =>
            c.Type == ClaimTypes.NameIdentifier || c.Type == "id")?.Value;

        DTO_Sesion sesion = new DTO_Sesion
        {
            RefreshToken = refreshToken,
            ID_Usuario = Convert.ToInt32(userId)
        };

        var respuesta = bllSesion.validarRefreshToken(sesion);

        if (respuesta.TipoRespuesta)
        {
            sesion = (DTO_Sesion)respuesta.Resultado[0];
            DTO_Usuario usuario = new() { ID_Usuario = sesion.ID_Usuario };
            usuario = (DTO_Usuario)bllUsuario.obtenerUsuarioPorId(usuario).Resultado[0];

            var nuevoToken = cipher.generarAccessToken(usuario);

            context.Response.StatusCode = 403;
            context.Response.ContentType = "application/json";
            //context.Response.Headers["Access-Control-Allow-Origin"] = System.Configuration.ConfigurationManager.AppSettings["ClientURL"];
            context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
            context.Response.Headers["Access-Control-Expose-Headers"] = "Content-Type, Authorization, accesToken";

            var result = JsonSerializer.Serialize(new
            {
                tipoRespuesta = true,
                mensaje = "Token renovado automáticamente",
                resultado = new[] { new { accesToken = nuevoToken } }
            });

            await context.Response.WriteAsync(result);
        }
    }
});

app.UseAuthentication();
app.UseAuthorization();
app.UseCookiePolicy();

app.MapHub<MonitorOSHub>("/hub/monitorOSHub");
app.MapControllers();

app.Run();
