import { Button, Col, Form, Input, Row, Table, Space, Spin } from "antd";
import React, { useRef, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { Excel } from "antd-table-saveas-excel";
import axios from "axios";

// const handlePrint = () => {
//   debugger;
//   const excel = new Excel();
//   excel
//     .addSheet("sheet 1")
//     .addColumns(columns)
//     .addDataSource(data, { str2Percent: true })
//     .saveAs("fileName.xlsx");
// };

// const data = [
//   {
//     key: "1",
//     name: "John Brown",
//     Category: 32,
//     address:
//       "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nam recusandae mollitia nostrum quis unde, rerum, optio voluptatibus, non fuga aspernatur veritatis maiores commodi sunt. Atque.",
//   },
//   {
//     key: "2",
//     name: "Joe Black",
//     Category: 42,
//     address: "London No. 1 Lake Park",
//   },
//   {
//     key: "3",
//     name: "Jim Green",
//     Category: 32,
//     address: "Sydney No. 1 Lake Park",
//   },
//   {
//     key: "4",
//     name: "Jim Red",
//     Category: 32,
//     address: "London No. 2 Lake Park",
//   },
// ];

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
  },
];

const Scrapper = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [excelName, setExcelName] = useState("");

  const onFinish = async (values) => {
    setLoading(true);
    console.log(values);
    setExcelName(values.fileName);

    const response = await axios.post("http://localhost:5000/", values, {
      headers: {
        "Content-Type": "application/json", // Add other default headers as needed
      },
    });

    console.log(response);
    setData(response.data);
    setLoading(false);
  };

  const handleDownload = () => {
    const filePath = `N:/My Projects/Web Scraper/server/${excelName}.csv`;

    // Open the file in a new browser tab
    window.open(filePath);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1>Google Maps Data Scrapper</h1>

        <Form
          layout="vertical"
          name="Scrapper-form"
          onFinish={onFinish}
          style={{ width: "70%" }}
        >
          <Row gutter={24}>
            <Col span={10}>
              <Form.Item
                name="googleUrl"
                label="Google Maps Url"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="fileName"
                label="File Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col offset={18}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div style={{ textAlign: "center", margin: "0 5%" }}>
        <Row>
          <Col offset={10}>
            <h2>Data List</h2>
          </Col>
          <Col offset={9} style={{ display: "flex", alignItems: "center" }}>
            <Button type="primary" onClick={handleDownload}>
              Export to Excel
              <DownloadOutlined style={{ fontSize: "1.2rem" }} />
            </Button>
          </Col>
        </Row>
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={data} />
        </Spin>
      </div>
    </>
  );
};
export default Scrapper;
