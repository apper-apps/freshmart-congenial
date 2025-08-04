import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import MonitoringDashboard from "@/components/pages/MonitoringDashboard";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import AdminPaymentGateways from "@/components/pages/AdminPaymentGateways";
import Account from "@/components/pages/Account";
import Checkout from "@/components/pages/Checkout";
import Home from "@/components/pages/Home";
import Categories from "@/components/pages/Categories";
import ProductDetail from "@/components/pages/ProductDetail";
import OrderDashboard from "@/components/pages/OrderDashboard";
import Cart from "@/components/pages/Cart";
import AdminDashboard from "@/components/pages/AdminDashboard";
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
<Routes>
          {/* Admin Routes (without main layout) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/payment-gateways" element={<AdminPaymentGateways />} />
          <Route path="/admin/orders" element={<OrderDashboard />} />
          <Route path="/admin/monitoring" element={<MonitoringDashboard />} />
          
          {/* Main App Routes (with layout) */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:category" element={<Categories />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="toast-container"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;