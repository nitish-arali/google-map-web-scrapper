import React, { useState, useCallback } from "react";
import {
  Table,
  Input,
  Space,
  Popconfirm,
  Button,
  ConfigProvider,
  Row,
  Col,
  Tooltip,
  notification,
  message,
} from "antd";
import {
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { SiMicrosoftexcel } from "react-icons/si";
import Highlighter from "react-highlight-words";
import { debounce } from "lodash";
import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";
// import { CSVLink } from "react-csv";

const CustomTable = ({
  columns,
  dataSource,
  isFilter,
  onDelete,
  onEdit,
  onView,
  size,
  actionColumn = true,
  style,
  scroll,
}) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = useCallback(
    debounce((value) => setSearchText(value.trim()), 200),
    []
  );

  const searchedData = searchText
    ? dataSource.filter((data) =>
        columns.some((col) =>
          data[col.dataIndex]
            ?.toString()
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      )
    : dataSource;

  const tableColumns = [
    ...columns.map((col) => ({
      ...col,
      sorter: (a, b) => {
        const aValue = a[col.dataIndex];
        const bValue = b[col.dataIndex];

        // If both values are numbers, sort numerically
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
        }

        // If both values are strings, sort alphabetically
        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }

        // If one value is undefined or null, move it to the end
        if (aValue === null || aValue === undefined) {
          return 1;
        }
        if (bValue === null || bValue === undefined) {
          return -1;
        }

        // Fallback to a basic comparison
        return aValue > bValue ? 1 : -1;
      },

      render: (text, record) => {
        let renderedText = col.render ? col.render(text, record) : text;
        return typeof renderedText === "string" ||
          typeof renderedText === "number" ? (
          <Highlighter
            highlightStyle={{
              color: "blue",
              padding: 0,
              backgroundColor: "#fff",
              fontWeight: "500",
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={renderedText?.toString()}
          />
        ) : (
          renderedText
        );
      },
    })),
  ];

  if (actionColumn) {
    tableColumns.push({
      title: "Action",
      key: "action",
      fixed: "right",
      width: "4rem",
      render: (text, record) => (
        <Space size="small">
          {onView && (
            <Button
              size="small"
              onClick={() => onView(record)}
              icon={<EyeOutlined style={{ fontSize: "0.9rem" }} />}
            ></Button>
          )}
          {onEdit && (
            <Button
              size="small"
              onClick={() => onEdit(record)}
              icon={<EditOutlined style={{ fontSize: "0.9rem" }} />}
            ></Button>
          )}
          {onDelete && (
            <Popconfirm
              title="Are you sure to delete this item?"
              onConfirm={() => onDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined style={{ fontSize: "0.9rem" }} />}
              ></Button>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  const exportPDF = () => {
    if (!dataSource || dataSource.length === 0) {
      notification.warning({
        message: "No data to export",
      });
      return;
    }
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const headers = tableColumns?.slice(0, -1).map((column) => column.title);

    const data = dataSource?.map(
      (item) => tableColumns.map((column) => item[column.dataIndex]) // map over each item in the dataSource
    ); // get data from dataSource

    let content = {
      startY: 50,
      head: [headers],
      body: data,
    };

    doc.text(" ", 250, 30);
    autoTable(doc, content);

    doc.save("export.pdf");
  };

  const exportCSV = () => {
    if (!dataSource || dataSource.length === 0) {
      notification.warning({
        message: "No data to export",
      });
      return;
    }

    // Prepare the headers
    const headers = columns.map((column) => column.title);

    // Prepare the data
    const data = dataSource.map((item) =>
      columns.map((column) => item[column.dataIndex])
    );

    // Convert data to CSV format
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      data.map((row) => row.join(",")).join("\n");

    // Create a link element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        padding: "0rem 0.5rem",
        marginTop: "1rem",
        backgroundColor: "#fff",
      }}
    >
      {isFilter && (
        <Row gutter={[32, 12]}>
          <Col
            xs={{ offset: 15, span: 3 }}
            sm={{ offset: 6, span: 3 }}
            md={{ offset: 12, span: 2 }}
            lg={{ offset: 14, span: 2 }}
            xl={{ offset: 16, span: 1 }}
          >
            <Tooltip title="Export to Pdf">
              <FilePdfOutlined
                onClick={exportPDF}
                style={{ fontSize: "1.8rem" }}
              />
            </Tooltip>
          </Col>
          {/* <Col
            xs={{ span: 3 }}
            sm={{ span: 3 }}
            md={{ span: 2 }}
            lg={{ span: 2 }}
            xl={{ span: 1 }}
          >
            <Tooltip title="Export to Excel">
              <SiMicrosoftexcel
                onClick={exportCSV}
                style={{ fontSize: "1.8rem" }}
              />
            </Tooltip>
          </Col> */}
          <Col
            xs={{ span: 24 }}
            sm={{ span: 12 }}
            md={{ span: 8 }}
            lg={{ span: 6 }}
            xl={{ span: 6 }}
          >
            <Input
              allowClear
              placeholder="Search in table"
              suffix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginBottom: "0.8rem", width: "100%" }}
            />
          </Col>
        </Row>
      )}
      <div style={{ overflowX: "auto" }}>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "#E6E6FA",
              },
            },
          }}
        >
          <Table
            style={style}
            columns={tableColumns}
            size={size ? size : "small"}
            bordered
            scroll={scroll}
            pagination={{
              showTotal: (total, range) =>
                `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            }}
            dataSource={searchedData}
          />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default CustomTable;
