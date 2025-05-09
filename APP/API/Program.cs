using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
    });

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();
app.UseCookiePolicy();
app.MapControllers();
app.Run();
