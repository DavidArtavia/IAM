
import { Button, Card, Row,  } from "antd";
import { useState } from "react";
// import { IProps } from "../../types/IProps";

export const Home = () => {

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleAction = (idx: number) => {
    // Implement your action here
    console.log("Button clicked:", idx);
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
              handleAction(idx);
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
