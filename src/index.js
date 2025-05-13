import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {Provider} from 'react-redux'
import store from './redux/store'

const rootElement = document.getElementById('root');

// Create a root using createRoot

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  // Render the App component
root.render(
  <React.StrictMode>
    <Provider store={store}>
    <div className="wavyBackground" >
      <App />
      </div>
    </Provider>
  </React.StrictMode>
);
} else {
  console.error("Root element not found! Check your HTML file.");
}

