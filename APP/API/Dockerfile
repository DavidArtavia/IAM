# Etapa única con SDK (simplifica, evita tener que conocer el nombre del DLL)
FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

# Copiamos todo el repo (monorepo) y publicamos/ejecutamos el proyecto en APP/API
COPY . .

# Render exige que los servicios Docker escuchen en el puerto 10000
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

# Para demo/producción, levanta en Release
CMD ["dotnet", "run", "--project", "APP/API", "--configuration", "Release"]