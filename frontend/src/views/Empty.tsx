import * as React from "react";
import { useLocation } from "react-router-dom";
export const Empty: React.FC = () => {
  const location = useLocation();
  return <div>{location.pathname} </div>;
};
