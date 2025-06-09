using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

public class EmailUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // Devuelve el claim del correo electrónico como identificador
        return connection.User?.FindFirst(ClaimTypes.Email)?.Value;
    }
}