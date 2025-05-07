using DTO;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace UTL
{
    public class UTL_Cipher
    {

        #region Atributos

        public String encryptKey = ""; // ConfigurationManager.AppSettings["EncryptKey"];
        public String desEncryptKey = ""; // ConfigurationManager.AppSettings["DesEncryptKey"];
        public String tokenKey = ""; // ConfigurationManager.AppSettings["TokenKey"];

        public String Jwt = ""; // ConfigurationManager.AppSettings["TokenKey"];
        private readonly IConfiguration? _config;

        #endregion

        #region Constructor
        public UTL_Cipher(IConfiguration config)
        {
            _config = config;
        }

        public UTL_Cipher() { }
        #endregion

        #region Set´s y Get's

        public string Encriptar(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_config["AES:Key"]);
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

        public string Desencriptar(string encryptedText)
        {
            var fullCipher = Convert.FromBase64String(encryptedText);

  
            var iv = new byte[16];
            var cipher = new byte[fullCipher.Length - 16];
            Buffer.BlockCopy(fullCipher, 0, iv, 0, iv.Length);
            Buffer.BlockCopy(fullCipher, iv.Length, cipher, 0, cipher.Length);

            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_config["AES:Key"]);
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
            new Claim(ClaimTypes.Role, usuario.Rol.ID_Usuario.ToString())
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                 issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        #endregion
    }
}
