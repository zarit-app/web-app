import React from "react";
import InfoIcon from "./icons/InfoIcon";
import SuccessIcon from "./icons/SuccessIcon";
import ErrorIcon from "./icons/ErrorIcon";
import CloseIcon from "./icons/CloseIcon";

const alertStyle = {
  backgroundColor: "white",
  color: "black",
  padding: "10px",
  textTransform: "uppercase",
  borderRadius: "3px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0px 2px 2px 2px rgba(0, 0, 0, 0.03)",
  fontFamily: "Fira Sans",
  width: "300px",
  boxSizing: "border-box",
};

const buttonStyle = {
  marginLeft: "20px",
  border: "none",
  backgroundColor: "transparent",
  cursor: "pointer",
  color: "#FFFFFF",
};

interface Props {
  message: any;
  options: any;
  style: any;
  close: any;
}

const AlertTemplate = ({ message, options, style, close }: Props) => {
  return (
    <div style={{ ...alertStyle, ...style }}>
      {options.type === "info" && <InfoIcon />}
      {options.type === "success" && <SuccessIcon />}
      {options.type === "error" && <ErrorIcon />}
      <span style={{ flex: 2 }}>{message}</span>
      <button onClick={close} style={buttonStyle}>
        <CloseIcon />
      </button>
    </div>
  );
};

export { AlertTemplate };
