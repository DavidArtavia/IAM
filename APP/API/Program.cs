var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

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

// ✅ Apply CORS before Authorization
app.UseCors("AllowFrontendDev");

app.UseAuthorization();

app.MapControllers();

app.Run();
