
import { DTO_Mensaje } from "@/models/DTO_Mensaje";
import { getBusinesses, sendTextMessage } from "@/services/chatServices";
import { Button, Card, Row,  } from "antd";
import { useState } from "react";
// import { IProps } from "../../types/IProps";

export const Home = () => {

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleAction = async () => {
    const mensaje: DTO_Mensaje = {
      ...new DTO_Mensaje(),
      textoMensaje: "Mensaje de ejemplo",
    };
    console.log("DTO_Mensaje que envio:", mensaje);
    try {
      const res = await sendTextMessage(mensaje);
      console.log("Respuesta de sendTextMessage", res);
    } catch (error) {
      console.log("Error al obtener los negocios", error);
    }
  };

  const label = [
    "ALGO 1",
    "ALGO 2",
    "ALGO 3",
    "ALGO 4",
    "ALGO 5",
    "ALGO 6",
    "ALGO 7",
  ]


  return (
    <div>
      {/* <Watermark content={["David", "Developing.."]}> */}
      <Row gutter={16} justify="space-evenly">
        {label.map((label, idx) => (
          <Button
            key={idx}
            type="primary"
            style={{
              backgroundColor: selectedIndex === idx ? "#2E6C60" : "#CBCBCB",
              borderColor: selectedIndex === idx ? "#1D443C" : "#CBCBCB",
              color: "#fff",
            }}
            onClick={() => {
              setSelectedIndex(idx);
              handleAction();
            }}
          >
            {label}
          </Button>
        ))}
      </Row>

      <Card style={{ marginTop: " 20px" }}>
        {" "}
        Iselect button {selectedIndex}
      </Card>
      {/* </Watermark> */}
    </div>
  );
};
