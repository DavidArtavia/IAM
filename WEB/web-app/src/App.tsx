import { BrowserRouter as Router } from "react-router-dom";
import { IProps } from "@/types/IProps";
import { AppRouter } from "@/routers/AppRouter";
import { Layout } from "@/components/Layout/Layout";

export const App = ({}: IProps) => {
  return (
    <Router>
      <Layout>
        <AppRouter />
      </Layout>
    </Router>
  );
};
