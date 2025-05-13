import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register required chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const OrdersChart = ({ orders }) => {
  if (orders.length === 0) return <p>Loading...</p>;

  // Step 1: Flatten cart items
  const allItems = orders.flatMap(order => order.cartItems);

  // Step 2: Group items by name and count occurrences
  const itemCounts = allItems.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {});

  // Step 3: Prepare chart data
  const data = {
    labels: Object.keys(itemCounts), // Item names
    datasets: [
      {
        label: "Item Count",
        data: Object.values(itemCounts), // Corresponding counts
        backgroundColor: "rgba(230, 53, 13, 0.6)", // Blue color
        borderColor: "gray", // Darker blue border
        borderWidth: 1,
      },
    ],
  };

  // Step 4: Configure chart options
  const options = {
    responsive: true,
    layout: {
        padding: {
          top: 40, // Adjust top padding to prevent cutoff
        },
    },
    plugins: {
      legend: { display: false }, // Hide legend
      title: { display: false, text: "Cart Items Count", font: { size: 18 } , }, // Title font size
      tooltip: { enabled: true },
      datalabels: {
        anchor: "end", // Position label at the top of the bar
        align: "top",
        color: "black",
        font: { weight: "bold", size: 18 }, // Font size of labels on bars
        formatter: (value) => value, // Ensure labels show exact values
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 18 } }, // Increase x-axis font size
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 18 }, stepSize: 1 }, // Increase y-axis font size
      },
    },
  };

  /*  const options = {
    layout: {
      padding: {
        top: 20, // Adjust top padding to prevent cutoff
      },
    },
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        offset: 6, // Move labels slightly above bars
        clip: false, // Prevent clipping inside the chart area
        color: "black",
        font: { weight: "bold", size: 16 },
        formatter: (value) => value,
      },
    },
  };*/
  return <Bar data={data} options={options} />;
};

export default OrdersChart;