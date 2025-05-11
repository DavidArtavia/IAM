using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UTL
{
    public class UTL_FileHandler
    {
        public string SaveFileToTempDirectory(byte[] fileData, string fileName)
        {
            // Obtener la ruta de la carpeta temporal
            string tempDirectory = Path.GetTempPath();

            // Crear la ruta completa para el archivo
            string filePath = Path.Combine(tempDirectory, fileName);

            // Guardar el archivo en la ruta temporal
            File.WriteAllBytes(filePath, fileData);

            return filePath;  // Devuelve la ruta completa donde se guardó el archivo
        }

        public void DeleteFileInToTempDirectory(string filePath)
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath); // Elimina el archivo de la ruta especificada
            }
        }
    }
}
