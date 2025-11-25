import React from "react";
import { Spin, Typography } from "antd";

const Loading = ({ isLoading = false, text = "" }) => {
  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 1000,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Spin size="large" />
        <Typography.Text style={{ marginTop: 16, display: "block" }}>
          {text || "Loading, please wait..."}
        </Typography.Text>
      </div>
    </div>
  );
};

export default Loading;
