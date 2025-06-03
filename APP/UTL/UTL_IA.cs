using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UTL
{
    public class UTL_IA
    {
        public static Dictionary<string, BinaryData> DtoRepuestaIaJsonSchema =>
            new Dictionary<string, BinaryData>
            {
                ["type"] = BinaryData.FromString(@"""object"""),
                ["properties"] = BinaryData.FromString(@"
                {
                  ""respuestaUsuario"":         { ""type"": ""string"" },
                  ""intencionDetectada"":       { ""type"": ""string"" },
                  ""paramsAccion"": {
                    ""type"": ""array"",
                    ""items"": {
                      ""type"": ""object"",
                      ""properties"": {
                        ""Nombre"": { ""type"": ""string"" },
                        ""Valor"":  { ""type"": ""string"" }
                      },
                      ""required"": [""Nombre"",""Valor""]
                    }
                  },
                  ""paramsIntencion"": {
                    ""type"": ""array"",
                    ""items"": {
                      ""type"": ""object"",
                      ""properties"": {
                        ""Nombre"": { ""type"": ""string"" },
                        ""Valor"":  { ""type"": ""string"" }
                      },
                      ""required"": [""Nombre"",""Valor""]
                    }
                  },
                  ""accionBakendDetectada"":       { ""type"": ""string"" },
                  ""ejecutarAccionBakend"":       { ""type"": ""boolean"" },
                  ""ejecutarIntencionDetectada"": { ""type"": ""boolean"" }
                }
                "),
                ["required"] = BinaryData.FromString(@"[
                  ""respuestaUsuario"",
                  ""intencionDetectada"",
                  ""paramsAccion"",
                  ""paramsIntencion"",
                  ""accionBakendDetectada"",
                  ""ejecutarAccionBakend"",
                  ""ejecutarIntencionDetectada""
                ]"),
                ["additionalProperties"] = BinaryData.FromString("false")
            };
    }

}
