using DTO;
using Microsoft.IdentityModel.Tokens;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace UTL
{
    public class UTL_Cipher
    {

        #region Constructor
        public UTL_Cipher(){}
        #endregion

        public string encriptar(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(ConfigurationManager.AppSettings["AesKey"] ?? "");
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;


            aes.GenerateIV();
            var iv = aes.IV;

            var encryptor = aes.CreateEncryptor(aes.Key, iv);
            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);


            var resultBytes = new byte[iv.Length + encryptedBytes.Length];
            Buffer.BlockCopy(iv, 0, resultBytes, 0, iv.Length);
            Buffer.BlockCopy(encryptedBytes, 0, resultBytes, iv.Length, encryptedBytes.Length);

            return Convert.ToBase64String(resultBytes);
        }

        public string desEncriptar(string encryptedText)
        {
            var fullCipher = Convert.FromBase64String(encryptedText);

  
            var iv = new byte[16];
            var cipher = new byte[fullCipher.Length - 16];
            Buffer.BlockCopy(fullCipher, 0, iv, 0, iv.Length);
            Buffer.BlockCopy(fullCipher, iv.Length, cipher, 0, cipher.Length);

            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(ConfigurationManager.AppSettings["AesKey"] ?? "");
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            var decryptor = aes.CreateDecryptor();
            var decryptedBytes = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);

            return Encoding.UTF8.GetString(decryptedBytes);
        }

        public String generarAccessToken(DTO_Usuario usuario)
        {
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, usuario.ID_Usuario.ToString()),
            new Claim(ClaimTypes.Email, usuario.CorreoUsuario),
            new Claim(ClaimTypes.Role, usuario.Rol.ID_Rol.ToString())
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ConfigurationManager.AppSettings["JwtKey"] ?? ""));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: ConfigurationManager.AppSettings["JwtIssuer"] ?? "",
                audience: ConfigurationManager.AppSettings["JwtAudience"] ?? "",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
