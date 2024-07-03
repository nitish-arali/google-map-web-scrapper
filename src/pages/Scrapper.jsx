import { Button, Col, Form, Input, Row, Space, Spin, Table } from "antd";
import React, { useEffect, useState } from "react";
import {
  DownloadOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import axios from "axios";
import useWebSocket from "react-use-websocket";
import CustomTable from "../components/CustomTable.jsx";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    width: "20%",
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "Category",
    width: "15%",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    width: "30%",
  },
  {
    title: "Phone Number",
    dataIndex: "phone",
    key: "Phone",
    width: "15%",
  },
  {
    title: "Website",
    dataIndex: "website",
    key: "Website",
    width: "20%",
    render: (text) => <a>{text}</a>,
  },
];

const Scrapper = () => {
  const [data, setData] = useState([]);
  const [totalSearchResults, setTotalSearchResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileLink, setFileLink] = useState("");
  const [error, setError] = useState("");

  const { sendMessage } = useWebSocket("ws://localhost:5000", {
    onMessage: (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "data") {
        setData((prevData) => [...prevData, ...message.data]);
      } else if (message.type === "complete") {
        setFileLink(message.fileName);
        setLoading(false);
      } else if (message.type === "error") {
        setError(message.error);
        setLoading(false);
      } else if (message.type === "totalResults") {
        setTotalSearchResults(message.data);
      } else if (message.type === "stopped") {
        setLoading(false);
      }
    },
    onClose: () => {
      console.log("WebSocket connection closed");
    },
    shouldReconnect: (closeEvent) => true,
  });

  const onFinish = async (values) => {
    setLoading(true);
    setFileName(values.fileName);
    setData([]);
    setFileLink("");
    setError("");
    setTotalSearchResults(0);

    try {
      await axios.post("http://localhost:5000", values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error starting the scraping process:", error);
      setError("Failed to start the scraping process");
      setLoading(false);
    }
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/download/${fileName}.csv`;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stopScraping = () => {
    sendMessage(JSON.stringify({ type: "stop" }));
  };

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Google Maps Data Scraper</h1>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          style={{ width: "70%" }}
        >
          <Row gutter={32}>
            <Col span={12}>
              <Form.Item
                label="Google URL"
                name="googleUrl"
                rules={[
                  { required: true, message: "Please input Google URL!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="File Name"
                name="fileName"
                rules={[{ required: true, message: "Please input file name!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end" gutter={16}>
            <Col>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  disabled={loading}
                >
                  Start Scraping
                </Button>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button
                  // type="outlined"
                  icon={<StopOutlined />}
                  onClick={stopScraping}
                  disabled={!loading}
                >
                  Stop Scraping
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div
        style={{
          width: "95%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {loading && (
          <Spin
            tip="Scraping data..."
            style={{ marginTop: 20, marginBottom: 20, textAlign: "center" }}
          />
        )}
        {totalSearchResults > 0 && (
          <div
            style={{
              marginTop: 20,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <p>Total Search Results: {totalSearchResults}</p>
            <p>
              Remaining:{" "}
              {totalSearchResults - (data.length > 0 ? data.length : 0)}
            </p>
          </div>
        )}
        {error && (
          <div
            style={{
              color: "red",
              marginTop: 20,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        {fileLink && (
          <Button
            type="primary"
            onClick={downloadFile}
            icon={<DownloadOutlined />}
            style={{ width: "min-content", margin: "0 auto" }}
          >
            {`Download ${fileName}.csv`}
          </Button>
        )}
        <CustomTable
          columns={columns}
          dataSource={data}
          rowKey={(record) => record.url}
          pagination={false}
          style={{ marginTop: 20, width: "100%" }}
          isFilter={true}
          actionColumn={false}
        />
      </div>
    </>
  );
};

export default Scrapper;
