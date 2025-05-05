import { Modal, Spin } from "antd";

interface LoadingModalProps {
    loadingMessage?: string;
}

export const LoadingModal = ({ loadingMessage }: LoadingModalProps) => {
  return (
    <Modal open={true} footer={null} closable={false} centered>
      <div style={{ textAlign: "center" }}>
        <Spin size="large" />
        <p>{loadingMessage}</p>
      </div>
    </Modal>
  );
};
