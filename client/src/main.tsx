import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./v1/assets/css/index.css";
import { Provider } from "react-redux";
import { store } from "./v1/redux/store/store.ts";
import { Toaster } from "./v1/components/ui/sonner.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
            <Toaster position='top-right' closeButton />
        </Provider>
    </React.StrictMode>
);
