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
import { getFirestore, collection, query, orderBy, startAfter, limit, getDocs, Timestamp  } from "firebase/firestore";
import {
  ClientSideRowModelModule,
  ColumnApiModule,
  CsvExportModule,
  ModuleRegistry,
  NumberFilterModule,
  TextFilterModule,
  ValidationModule,
  DateFilterModule,
  RowApiModule,
  createGrid,
  RowStyleModule
} from "ag-grid-community";

import styles from "./DataGrid.module.scss";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnApiModule,
  TextFilterModule,
  NumberFilterModule,
  CsvExportModule,
  DateFilterModule,
  RowApiModule,
  ValidationModule /* Development Only */,
  RowStyleModule
]);
const MedalCellRenderer = ({ status, id, updateStatus , deleteOrder }) => {
  return (
    <div className="--flex-center">
      <label> {status.toLowerCase() === "pending" ? "בהמתנה" : "מאושר"}</label>
      <button
        className="--btn"
        style={{
          background: status.toLowerCase() === "confirmed" ? "green" : "red",
          width: "100%",
        }}
        onClick={() => {
          const newStatus = status === "confirmed" ? "pending" : "confirmed";
          updateStatus(id, newStatus);
        }}>
        עידכון
      </button>
      <button onClick={()=>{
              deleteOrder(id)}}>ביטול

        </button>
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

const DataGrid = ({ dataSource, updateOrder ,deleteOrder , setPageSize}) => {
  const gridRef = useRef(null);
  const [showMainColumns, setShowMainColumns] = useState(true);
  const containerStyle = useMemo(() => ({ width: "50vw", height: "70vh" }), []);
  const gridContainerStyle = useMemo(() => ({ width: "40vw", height: "70vh" ,position:"relative",right:"20rem"}), []);
  const [rowData, setRowData] = useState();
  const [columnApi, setColumnApi] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [loading, setLoading] = useState(false);

  const [columnDefs, setColumnDefs] = useState([
    {
      headerName: "פרטים אישיים",
      children: [
        {
          field: "id",
          headerName: "קוד הזמנה",
          sortable: true,
          filter: true,
          textAlign: "end",
          hide: true,
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
                    fontSize: "2rem",
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
          hide: true,
          cellRenderer: (params) => {
            return (
              <h3
                style={{
                  color:
                    params.data.status.toLowerCase() === "pending"
                      ? "red"
                      : "green",
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
              >
                {params.value}
              </h3>
            );
          },
        },
      ],
    },
    {
      headerName: "",
      children: [
        {
          field: "date",
          headerName: "נוצר בתאריך",
          sortable: true,
          filter: true,
          maxWidth: 200,
          hide: true,
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
          field: "accountNumber",
          headerName: "מספר חשבון",
          sortable: true,
          filter: true,
          maxWidth: 250,
          hide: false,
          fontSize: 20,
          headerStyle: { 'background-color': 'silver' ,'font-size':'2rem'},
        },
        {
          field: "fullName",
          headerName: "שם חבר",
          sortable: true,
          filter: true,
          maxWidth: 250,
          flex: 2,
          hide: false,
          headerStyle: { 'background-color': 'silver' ,'font-size':'2rem'},
        },
        {
          field: "totalAmount",
          headerName: "סכום לחוב",
          sortable: true,
          filter: true,
          maxWidth: 250,
          hide: false,
          headerStyle: { 'background-color': 'silver' ,'font-size':'2rem'},
        },
        // { field: "cartItems", headerName: "פירוט הזמנה",sortable: true, filter: true , minWidth: 50 },
        {
          field: "cartItems",
          headerName: "פירוט הזמנה",
          sortable: true,
          filter: true,
          minWidth: 150,
          flex: 2,
          hide: true,
          cellRenderer: (params) => (
            <CartItemsCellRenderer cartItems={params.value} />
          ),
        },
        {
          field: "status",
          headerName: "סטטוס",
          sortable: true,
          filter: true,
          maxWidth: 150,
          hide: true,
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

  const toggleColumn = (column, isVisible) => {
    if (!columnApi) return; // Ensure columnApi is available
    columnApi.setColumnVisible(column, isVisible);
  };

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

  const onDeleteOrder = useCallback((id, status) => {
    deleteOrder(id);
  }, []);

  const onUpdateOrder = useCallback((id, status) => {
    updateOrder(id, status);
  }, []);

  const getRowStyle = (params) => {
    return { fontSize: "2rem" };
  };
  // onGridReady callback
  const onGridReady = useCallback(
    (params) => {
      // Get the grid API and column API from the params
      const { api, columnApi } = params;

      // Set both APIs into their respective state
      setGridApi(api);
      setColumnApi(columnApi);

      // Initialize the row data
      setRowData(dataSource);
    },
    [dataSource]
  ); // Add dataSource as a dependency to re-fetch data when it changes

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

    // Group and summarize data by accountNumber and fullName
    const accountSummary = filteredData.reduce((acc, order) => {
        if (!order.email) return acc; // Skip entries without an email

        const userInfo = userLookup[order.email.toLowerCase()] || {
            firstName: "",
            lastName: "",
            accountNumber: "",
            cellular: "",
        };

        const accountKey = `${userInfo.accountNumber}|${userInfo.firstName} ${userInfo.lastName}`;

        // Initialize account entry if not exists
        if (!acc[accountKey]) {
            acc[accountKey] = {
                accountNumber: userInfo.accountNumber,
                fullName: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
                totalAmount: 0,
            };
        }

        // Accumulate totalAmount for the accountNumber and fullName
        acc[accountKey].totalAmount += Number(order.totalAmount) || 0;

        return acc;
    }, {});

    // Convert to array format and sort by accountNumber (ascending)
    const exportData = Object.values(accountSummary)
        .map((account) => ({
            accountNumber: account.accountNumber,
            fullName: account.fullName,
            totalAmount: account.totalAmount.toFixed(2), // Format totalAmount
        }))
        .sort((a, b) => a.accountNumber.localeCompare(b.accountNumber, "en", { numeric: true }));

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

  //   // Fetch accounts data from Firestore
  //   const usersCollection = collection(db, "users");
  //   const usersSnapshot = await getDocs(usersCollection);

  //   // Create a lookup object for quick access by email
  //   const userLookup = usersSnapshot.docs.reduce((acc, doc) => {
  //     const user = doc.data();
  //     if (user.email) {
  //       acc[user.email.toLowerCase()] = {
  //         firstName: user.firstName || "",
  //         lastName: user.lastName || "",
  //         accountNumber: user.accountNumber || "",
  //         cellular: user.cellular || "",
  //       };
  //     }
  //     return acc;
  //   }, {});

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

  //   // Group and summarize data by accountNumber
  //   const accountSummary = filteredData.reduce((acc, order) => {
  //     if (!order.email) return acc; // Skip entries without an email

  //     const userInfo = userLookup[order.email.toLowerCase()] || {
  //       firstName: "",
  //       lastName: "",
  //       accountNumber: "",
  //       cellular: "",
  //     };

  //     // Group by accountNumber
  //     if (!acc[userInfo.accountNumber]) {
  //       acc[userInfo.accountNumber] = {
  //         totalAmount: 0,
  //         emails: new Set(),
  //       };
  //     }

  //     // Add user email to the set of emails under the same account number
  //     acc[userInfo.accountNumber].emails.add(order.email);

  //     // Accumulate totalAmount for the account number
  //     acc[userInfo.accountNumber].totalAmount += Number(order.totalAmount) || 0;

  //     return acc;
  //   }, {});

  //   // Prepare data for CSV export: Each user on a new line
  //   const exportData = [];
  //   Object.values(accountSummary).forEach((account) => {
  //     Array.from(account.emails).forEach((email) => {
  //       const user = userLookup[email.toLowerCase()];
  //       exportData.push({
  //         accountNumber: user.accountNumber,
  //         fullName: `${user.firstName} ${user.lastName}`,
  //         totalAmount: account.totalAmount.toFixed(2), // Use the total amount from the account summary
  //       });
  //     });
  //   });

  //   // Generate CSV content
  //   const csvContent =
  //     "\uFEFF" +
  //     [
  //       ["מספר חשבון", "שם חבר", "סכום לחוב"], // Column headers
  //       ...exportData.map((item) => [
  //         item.accountNumber,
  //         item.fullName,
  //         item.totalAmount,
  //       ]),
  //     ]
  //       .map((e) => e.join(","))
  //       .join("\n");

  //   // Create a Blob for CSV with UTF-8 encoding and download it
  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   if (link.download !== undefined) {
  //     const fileName = `monthly_summary_${new Date()
  //       .toISOString()
  //       .slice(0, 10)}.csv`;
  //     link.setAttribute("href", URL.createObjectURL(blob));
  //     link.setAttribute("download", fileName);
  //     link.click();
  //   }
  // });

  const onExportAllOrders = useCallback(() => {
    //all orders
    gridRef.current.api.exportDataAsCsv();
  }, []);

  return (
    <div style={containerStyle}>
      <div className={styles.content}>
        <div className={styles.buttons}>
    
          <button
            onClick={onBtSumMonthlyExport}
            style={{ marginBottom: "5px", fontWeight: "bold" }} >
            סיכום חודשי
          </button>
        </div>
        <div className="grid-wrapper">
          <div style={gridContainerStyle}>
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

export default DataGrid;
