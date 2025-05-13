"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  StrictMode,
  useEffect,
} from "react";
import { db } from "../../firebase/config";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "ag-grid-react";

import {
  ClientSideRowModelModule,
  CsvExportModule,
  ModuleRegistry,
  NumberFilterModule,
  TextFilterModule,
  ValidationModule,
  DateFilterModule,
  RowApiModule,
  createGrid,
} from "ag-grid-community";

import { collection, getDocs, Timestamp } from "firebase/firestore";
import styles from "./DataGrid.module.scss";
import { FaEdit, FaTrash , FaCheckCircle } from "react-icons/fa";


ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  ClientSideRowModelModule,
  CsvExportModule,
  DateFilterModule,
  RowApiModule,
  ValidationModule /* Development Only */,
]);
const MedalCellRenderer = ({ status, id, updateStatus, deleteOrder }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "7.4rem 1fr 1fr",
        justifyItems:'center',
        gap: "1rem",
      }}
    >
      <label   style={{
          background: status.toLowerCase() === "confirmed" ? "green" : "red",
          width: "100%",
        }}>    {status.toLowerCase() === "pending" ? "בהמתנה" : "נמכר"}
      </label>
      <div className="--flex-center">
        <FaCheckCircle 
        style={{cursor:'pointer'}}
        color={status === "confirmed" ? "green":"red"}  onClick={() => {
          const newStatus = status === "confirmed" ? "pending" : "confirmed";
          updateStatus(id, newStatus);
        }}/>
        &nbsp;&nbsp;&nbsp;
        &nbsp;&nbsp;&nbsp;
        <FaTrash 
           style={{cursor:'pointer'}}
        color="red"   onClick={() => {
          deleteOrder(id);
        }} />
      </div>
    </div>
  );
};

const CartItemsCellRenderer = ({ cartItems }) => {
  if (!cartItems || cartItems.length === 0) return <span>No items</span>;

  return (
    <div style={{ width: "auto", padding: "5px", borderRadius: "5px" }}>
      {cartItems.map((item) => `${item.name}  ש"ח${item.price}`).join(", ")}
    </div>
  );
};

const DataGridExtended = ({ dataSource, updateOrder, deleteOrder }) => {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: "80vw", height: "70vh" }), []);
  const gridStyle = useMemo(() => ({ width: "80vw", height: "70vh" }), []);
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([
    {
      children: [
        {
          field: "id",
          headerName: "קוד הזמנה",
          sortable: true,
          filter: true,
          textAlign: "end",
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
          cellRenderer: (params) => {
            const idValue = params.value;
            // Ensure the id is at least 6 digits long
            const lastSix = idValue.slice(-6);
            const firstPart = idValue.slice(0, -6);

            return (
              <span>
                {firstPart}
                <span
                  style={{
                    color:
                      params.data.status.toLowerCase() === "pending"
                        ? "red"
                        : "green",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                  }}
                >
                  {lastSix}
                </span>
              </span>
            );
          },
        },
        {
          field: "email",
          headerName: "מייל",
          sortable: true,
          filter: true,
          maxWidth: 300,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
          cellRenderer: (params) => {
            return (
              <h3
                style={{
                  color:
                    params.data.status.toLowerCase() === "pending"
                      ? "red"
                      : "green",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {params.value}
              </h3>
            );
          },
        },{
          field: "firstName",
          headerName: "שם פרטי",
          sortable: true,
          filter: true,
          maxWidth: 300,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
        },
        {
          field: "lastName",
          headerName: "שם משפחה",
          sortable: true,
          filter: true,
          maxWidth: 300,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
        }
      ],
    },
    {
      children: [
        {
          field: "date",
          headerName: "נוצר בתאריך",
          sortable: true,
          filter: true,
          maxWidth: 200,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
          filter: "agDateColumnFilter",
          filterParams: {
            comparator: (filterLocalDateAtMidnight, cellValue) => {
              const cellDate = new Date(cellValue);
              if (isNaN(cellDate)) {
                return -1;
              }

              // Compare only the date parts
              const cellDateWithoutTime = new Date(
                cellDate.getFullYear(),
                cellDate.getMonth(),
                cellDate.getDate()
              );
              // Compare the two dates
              if (cellDateWithoutTime < filterLocalDateAtMidnight) {
                return -1;
              } else if (cellDateWithoutTime > filterLocalDateAtMidnight) {
                return 1;
              } else {
                return 0;
              }
            },
            // Optional: Use browser's date picker
            browserDatePicker: true,
          },
          valueFormatter: function (params) {
            const date = new Date(params.value);
            return date.toLocaleDateString("il-HE", {
              hour: "2-digit",
              minute: "2-digit",
            }); // Customize the format as needed
          },
        },
        {
          field: "totalAmount",
          headerName: "סכום",
          sortable: true,
          filter: true,
          maxWidth: 100,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
        },
        {
          field: "remark",
          headerName: "הערות",
          sortable: true,
          filter: true,
          maxWidth: 100,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
        },
        {
          field: "cartItems",
          headerName: "פירוט הזמנה",
          sortable: true,
          filter: true,
          minWidth: 50,
          flex: 2,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
          cellRenderer: (params) => (
            <CartItemsCellRenderer cartItems={params.value} />
          ),
        },
        {
          field: "status",
          headerName: "סטטוס",
          sortable: true,
          filter: true,
          minWidth: 50,
          maxWidth: 200,
          flex: 2,
          headerStyle: { "background-color": "silver", "font-size": "1.2rem" },
          cellRenderer: (params) => (
            <MedalCellRenderer
              status={params.data.status}
              id={params.data.id}
              updateStatus={onUpdateOrder}
              deleteOrder={onDeleteOrder}
            />
          ),
        },
      ],
    },
  ]);

  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      minWidth: 100,
      flex: 1,
    };
  }, []);

  const gridOptions = {
    // ... other grid options ...
    defaultCsvExportParams: {
      processCellCallback: function (params) {
        let value = params.value;
        // Check if the value is an array
        if (Array.isArray(value)) {
          // Iterate over the array and extract productName and price
          return value
            .map((item) => {
              if (item.name && item.price) {
                return `${item.name} - ${item.price}`;
              }
              return "Data not available"; // Fallback if properties are missing
            })
            .join(", "); // Join the items into a single string
        }

        // Return empty string for null or undefined values
        if (value == null) {
          return "";
        }

        // Case 1: If the value is a timestamp (milliseconds since 1970), format as Date-Time
        if (typeof value === "number" && value > 1000000000000) {
          // Timestamp check
          let date = new Date(value);
          const formattedDate = date.toLocaleDateString("en-US"); // MM/DD/YYYY
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }); // HH:mm
          return `${formattedDate} ${formattedTime}`;
        }

        // Case 2: If the value is a number but NOT a timestamp, format as price (2 decimal places)
        if (typeof value === "number") {
          return value.toFixed(2); // Format price (e.g., 999.99)
        }

        // Case 3: For text or other values, return as is
        return value;
      },
    },
  };

  const onUpdateOrder = useCallback((id, status) => {
    updateOrder(id, status);
  }, []);

  const onDeleteOrder = useCallback((id, status) => {
    deleteOrder(id, status);
  }, []);

  const onGridReady = useCallback((params) => {
    setRowData(dataSource);
  }, []);

  const getAccounts = async () => {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    // Create a lookup object for quick access by email
    const userLookup = usersSnapshot.docs.reduce((acc, doc) => {
      const user = doc.data();
      if (user.email) {
        acc[user.email.toLowerCase()] = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          accountNumber: user.accountNumber || "",
          cellular: user.cellular || "",
        };
      }
      return acc;
    }, {});
  };

  // const onBtSumMonthlyExport = useCallback(async () => {
  //   if (!gridRef.current || !gridRef.current.api) {
  //     console.error("Grid API is not ready");
  //     return;
  //   }

  //   const rowData = [];

  //   // Collect row data
  //   gridRef.current.api.forEachNode((node) => {
  //     if (node.data) {
  //       rowData.push(node.data);
  //     }
  //   });

  //   if (rowData.length === 0) {
  //     console.warn("No data found in the grid.");
  //     return;
  //   }

  // // Fetch accounts data from Firestore
  // const usersCollection = collection(db, "users");
  // const usersSnapshot = await getDocs(usersCollection);

  // // Create a lookup object for quick access by email
  // const userLookup = usersSnapshot.docs.reduce((acc, doc) => {
  //   const user = doc.data();
  //   if (user.email) {
  //     acc[user.email.toLowerCase()] = {
  //       firstName: user.firstName || "",
  //       lastName: user.lastName || "",
  //       accountNumber: user.accountNumber || "",
  //       cellular: user.cellular || "",
  //     };
  //   }
  //   return acc;
  // }, {});

  //   // Get first day of the current month
  //   const firstDayOfMonth = new Date();
  //   firstDayOfMonth.setDate(1);
  //   firstDayOfMonth.setHours(0, 0, 0, 0);

  //   // Filter data: Only include orders that are "confirmed" and from this month
  //   const filteredData = rowData.filter((order) => {
  //     const orderDate = new Date(order.date);
  //     return (
  //       orderDate >= firstDayOfMonth &&
  //       order.status.toLowerCase() === "confirmed"
  //     );
  //   });

  //   // Summarize totalAmount per email
  //   const emailSummary = filteredData.reduce((acc, order) => {
  //     if (!order.email) return acc; // Skip entries without an email

  //     const userInfo = userLookup[order.email.toLowerCase()] || { firstName: "", lastName: "", accountNumber: "", cellular: "" };

  //     if (!acc[order.email]) {
  //       acc[order.email] = {
  //         totalAmount: 0,
  //         firstName: userInfo.firstName,
  //         lastName: userInfo.lastName,
  //         accountNumber: userInfo.accountNumber,
  //         cellular: userInfo.cellular,
  //       };
  //     }

  //     // Ensure totalAmount is always a number
  //     acc[order.email].totalAmount += Number(order.totalAmount) || 0;

  //     return acc;
  //   }, {});

  //   // // Convert summarized data to CSV format
  //   // let csvContent = "Email,Total Amount (confirmed Orders),First Name,Last Name,Account Number\n";
  //   // Object.entries(emailSummary).forEach(([email, details]) => {
  //   //   csvContent += `"${email}",${(details.totalAmount || 0).toFixed(2)},"${details.firstName}","${details.lastName}","${details.accountNumber}"\n`;
  //   // });
  //   // Add UTF-8 BOM for proper Hebrew encoding
  //   const BOM = "\uFEFF";

  //   // Convert summarized data to CSV format
  //   let csvContent = BOM + "אימייל,סכום כולל (הזמנות מאושרות),שם פרטי,שם משפחה,מספר חשבון,טלפון\n";

  //   Object.entries(emailSummary).forEach(([email, details]) => {
  //     csvContent += `"${email}",${(details.totalAmount || 0).toFixed(2)},"${details.firstName}${details.lastName}","${details.accountNumber}","\t${details.cellular}"\n`;
  //   });

  //   // Download CSV
  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = `confirmed_orders_summary_${new Date().toISOString().slice(0, 7)}.csv`; // Example: confirmed-02.csv
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }, []);

  const onBtSumMonthlyExport = useCallback(async () => {
    if (!gridRef.current || !gridRef.current.api) {
      console.error("Grid API is not ready");
      return;
    }

    const rowData = [];

    // Collect row data
    gridRef.current.api.forEachNode((node) => {
      if (node.data) {
        rowData.push(node.data);
      }
    });

    if (rowData.length === 0) {
      console.warn("No data found in the grid.");
      return;
    }

    // Fetch accounts data from Firestore
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    // Create a lookup object for quick access by email
    const userLookup = usersSnapshot.docs.reduce((acc, doc) => {
      const user = doc.data();
      if (user.email) {
        acc[user.email.toLowerCase()] = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          accountNumber: user.accountNumber || "",
          cellular: user.cellular || "",
        };
      }
      return acc;
    }, {});

    // Get first day of the current month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Filter data: Only include orders that are "confirmed" and from this month
    const filteredData = rowData.filter((order) => {
      const orderDate = new Date(order.date);
      return (
        orderDate >= firstDayOfMonth &&
        order.status.toLowerCase() === "confirmed"
      );
    });

    // Group and summarize data by accountNumber
    const accountSummary = filteredData.reduce((acc, order) => {
      if (!order.email) return acc; // Skip entries without an email

      const userInfo = userLookup[order.email.toLowerCase()] || {
        firstName: "",
        lastName: "",
        accountNumber: "",
        cellular: "",
      };

      // Group by accountNumber
      if (!acc[userInfo.accountNumber]) {
        acc[userInfo.accountNumber] = {
          totalAmount: 0,
          emails: new Set(),
        };
      }

      // Add user email to the set of emails under the same account number
      acc[userInfo.accountNumber].emails.add(order.email);

      // Accumulate totalAmount for the account number
      acc[userInfo.accountNumber].totalAmount += Number(order.totalAmount) || 0;

      return acc;
    }, {});

    // Prepare data for CSV export: Each user on a new line
    const exportData = [];
    Object.values(accountSummary).forEach((account) => {
      Array.from(account.emails).forEach((email) => {
        const user = userLookup[email.toLowerCase()];
        exportData.push({
          accountNumber: user.accountNumber,
          fullName: `${user.firstName} ${user.lastName}`,
          totalAmount: account.totalAmount.toFixed(2), // Use the total amount from the account summary
        });
      });
    });

    // Generate CSV content
    const csvContent =
      "\uFEFF" +
      [
        ["מספר חשבון", "שם חבר", "סכום לחוב"], // Column headers
        ...exportData.map((item) => [
          item.accountNumber,
          item.fullName,
          item.totalAmount,
        ]),
      ]
        .map((e) => e.join(","))
        .join("\n");

    // Create a Blob for CSV with UTF-8 encoding and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const fileName = `monthly_summary_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", fileName);
      link.click();
    }
  });

  const onExportAllOrders = useCallback(() => {
    //all orders
    gridRef.current.api.exportDataAsCsv();
  }, []);

  //   const components = useMemo(() => {
  //     return {
  //       medalRenderer: MedalCellRenderer,
  //     };
  //   }, []);
  const getRowStyle = (params) => {
    return { fontSize: "1.4rem" };
  };
  return (
    <div style={containerStyle}>
      <div className={styles.content}>
        <div className={styles.buttons}>
          <button
            onClick={onExportAllOrders}
            style={{ marginBottom: "5px", fontWeight: "bold" }}
          >
            כל ההזמנות
          </button>

          {/* <button
                onClick={onBtSumMonthlyExport}
                style={{ marginBottom: "5px", fontWeight: "bold" }}
              >
                סיכום חודשי
              </button> */}
        </div>
        <div className="grid-wrapper">
          <div style={gridStyle}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              gridOptions={gridOptions}
              getRowStyle={getRowStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataGridExtended;
