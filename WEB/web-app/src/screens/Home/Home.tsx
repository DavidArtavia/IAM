import { Watermark } from "antd";
import { IProps } from "../../types/IProps";


export const Home = ({}: IProps) => {
  return (
    <div style={{ padding: "20px" }}>
      <Watermark content={["David", "Developing.."]}>
        <h2>Home</h2>
        <p>Welcome to the main page of the workshop app</p>
        <div style={{ height: 300 }} />
      </Watermark>
    </div>
  );
};
