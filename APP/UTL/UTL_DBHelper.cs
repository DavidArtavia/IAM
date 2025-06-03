using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UTL
{
    public class UTL_DBHelper

    {
        public static System.DateTime EMPTY_DATETIME; // DateTime.Parse("0001/01/01")

        public static Object GetNullSafeString(System.String value)
        {
            return (value != null) ? ((object)value) : (DBNull.Value);
        }

        /// <summary>
        /// Valida que las cadenas vacias se vayan como null
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static Object GetNullSafeEmptyString(System.String value)
        {
            return (value != null && !String.IsNullOrEmpty(value.Trim())) ? ((object)value) : (DBNull.Value);
        }

        public static Object GetNullSafeDateTime(System.DateTime value)
        {
            return (value != EMPTY_DATETIME) ? ((object)value) : (DBNull.Value);
        }

        public static Object GetNullSafePrimaryKey(System.Int32 value)
        {
            return (value > 0) ? ((object)value) : (DBNull.Value);
        }

        /// <summary>
        ///  Variante de 'GetNullSafeValue' es util para Primary Key de las entidades, asume que un valor 0 es equivalente a DbNull.Value.
        ///  Se comporta de la siguiente forma 
        ///  si el parametro src_value es null devuelve DBNull.Value de igual forma 
        ///  si el valor src_value#target_property es 0 devuelve DBNull.Value
        ///  en caso contrario devuelve el valor de la propiedad
        /// </summary>
        /// <param name="src_value"></param>
        /// <param name="target_property"></param>
        /// <returns>cuando no hay condiciones de error retorna System.Int32 o DbNull.Value</returns>
        public static Object GetNullSafePrimaryKey(Object src_object, String property_name)
        {
            Object value;

            if (src_object != null)
            {
                if ((value = GetPropertyValue(src_object, property_name)) is System.Int32)
                {
                    Int32 valor_propiedad = (Int32)value;
                    return (valor_propiedad > 0) ? (value) : (DBNull.Value);
                }
                else
                {
                    throw new Exception(src_object.GetType().FullName + "#" + property_name + " It is not System.Int32");
                }
            }
            return DBNull.Value;
        }

        public static decimal ReadNullSafeDecimal(object v)
        {

            return Convert.ToDecimal(v);
        }

        /// <summary>
        ///  Variante de 'GetNullSafeValue' similar a GetNullSafePrimaryKey, excepto que un valor 0 o mayor son validos y valores negativos son considerados como DbNull.Value.
        ///  Se comporta de la siguiente forma 
        ///  si el parametro src_value es null devuelve DBNull.Value de igual forma 
        ///  si el valor src_value#target_property es negativo devuelve DBNull.Value
        ///  en caso contrario devuelve el valor de la propiedad
        /// </summary>
        /// <param name="src_value"></param>
        /// <param name="target_property"></param>
        /// <returns>cuando no hay condiciones de error retorna System.Int32 o DbNull.Value</returns>
        public static Object GetNullSafeZeroBasePrimaryKey(Object src_object, String property_name)
        {
            Object value;

            if (src_object != null)
            {
                if ((value = GetPropertyValue(src_object, property_name)) is System.Int32)
                {
                    Int32 valor_propiedad = (Int32)value;
                    return (valor_propiedad >= 0) ? (value) : (DBNull.Value);
                }
                else
                {
                    throw new Exception(src_object.GetType().FullName + "#" + property_name + " It is not System.Int32");
                }
            }
            return DBNull.Value;
        }

        private static Object GetPropertyValue(Object src_object, String property_name)
        {
            System.Reflection.PropertyInfo property = null;

            if ((property = src_object.GetType().GetProperty(property_name)) != null)
            {
                return property.GetValue(src_object, new object[] { });
            }
            else
            {
                throw new Exception(src_object.GetType().FullName + "#" + property_name + " Not registered!!!");
            }
        }

        /// <summary>
        /// Devuelve el valor de la propiedad src_object#target_property, DbNull.Value si src_object es null o la propiedad es null
        /// </summary>
        /// <param name="src_object"></param>
        /// <param name="target_property"></param>
        /// <returns></returns>
        public static Object GetNullSafeValue(Object src_object, String property_name)
        {
            Object value;

            if (src_object != null)
            {
                if ((value = GetPropertyValue(src_object, property_name)) != null)
                {
                    return value;
                }
            }
            return DBNull.Value;
        }

        public static Object SetNullSafeValue(Object dst_object, String dst_property, Object dst_value)
        {
            if (dst_value == null) return null;
            if (dst_value != null && dst_value != DBNull.Value)
            {
                System.Reflection.PropertyInfo property;

                if ((property = dst_object.GetType().GetProperty(dst_property)) != null)
                {
                    Object casting_value = Convert.ChangeType(dst_value, property.PropertyType);
                    property.SetValue(dst_object, casting_value, new Object[] { });
                }
                else
                {
                    throw new Exception(dst_object.GetType().FullName + "#" + dst_property + " Property is not available!!!");
                }
            }
            return (Object)dst_object;
            //return (dst_value != null && dst_value != DBNull.Value) ? (dst_object) : (null);
        }

        public static byte[] ReadNullSafeImage(object db_value)
        {
            if (db_value is byte[])
            {
                return (byte[])db_value;
            }
            return null;
        }

        public static System.Int32 ReadNullSafeInt(Object db_value)
        {
            return ReadNullSafeInt(db_value, 0);
        }

        public static System.Int32 ReadNullSafeInt(Object db_value, int default_value)
        {
            if (db_value is System.Int32)
            {
                return (System.Int32)db_value;
            }
            if (db_value is System.Int16)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(Int32));
                return (System.Int32)casting_value;
            }
            if (db_value is System.Int64)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(Int32));
                return (System.Int32)casting_value;
            }
            if (db_value is System.Decimal)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(Int32));
                return (System.Int32)casting_value;
            }
            if (db_value is System.String)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(Int32));
                return (System.Int32)casting_value;
            }
            return default_value;
        }

        public static System.DateTime? ReadNullSafeDateTime(Object db_value)
        {
            return ReadNullSafeDateTime(db_value, EMPTY_DATETIME);
        }

        public static System.DateTime? ReadNullSafeDateTime(Object db_value, DateTime? default_value = null)
        {
            if (db_value is System.DateTime)
            {
                return (System.DateTime)db_value;
            }
            return default_value;
        }

        public static System.String ReadNullSafeString(Object db_value)
        {
            return ReadNullSafeString(db_value, null);
        }

        public static System.String ReadNullSafeString(Object db_value, String default_value)
        {
            if (db_value is System.String)
            {
                return (System.String)db_value;
            }
            if (db_value is System.Int16)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(String));
                return (System.String)casting_value;
            }
            if (db_value is System.Int32)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(String));
                return (System.String)casting_value;
            }
            if (db_value is System.Int64)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(String));
                return (System.String)casting_value;
            }
            else if (db_value is System.Decimal)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(String));
                return (System.String)casting_value;
            }
            return default_value;
        }

        public static System.Double ReadNullSafeDouble(Object db_value)
        {
            return ReadNullSafeDouble(db_value, 0);
        }

        public static System.Double ReadNullSafeDouble(Object db_value, System.Double default_value)
        {
            if (db_value is System.Double)
            {
                return (System.Double)db_value;
            }
            else if (db_value is System.Decimal)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(Double));
                return (System.Double)casting_value;
            }
            return default_value;
        }

        public static float ReadNullSafeFloat(Object db_value)
        {
            return ReadNullSafeFloat(db_value, 0);
        }

        public static float ReadNullSafeFloat(Object db_value, float default_value)
        {
            if (db_value is float)
            {
                return (float)db_value;
            }
            else if (db_value is System.Double)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(float));
                return (float)casting_value;
            }
            else if (db_value is System.String)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(float));
                return (float)casting_value;
            }
            return default_value;
        }

        public static System.Boolean ReadNullSafeBoolean(Object db_value)
        {
            return ReadNullSafeBoolean(db_value, false);
        }

        public static System.Boolean ReadNullSafeBoolean(Object db_value, System.Boolean default_value)
        {
            if (db_value is System.Boolean)
            {
                return (System.Boolean)db_value;
            }
            else if (db_value is System.Decimal)
            {
                System.Object casting_value = Convert.ChangeType(db_value, typeof(Boolean));
                return (System.Boolean)casting_value;
            }
            return default_value;
        }

        /*
        public Database GenerarDatabase()
        {
            Database dataBase = DatabaseFactory.CreateDatabase("SIRESEP");
            return dataBase;
        }
        */


        public static char ReadNullSafeChar(object p)
        {
            throw new NotImplementedException();
        }
    }
}

