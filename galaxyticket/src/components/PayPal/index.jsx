// src/components/PayPal/index.jsx
import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Swal from "sweetalert2";

const PayPal = ({ dola }) => {
  const usdAmount = Math.round((dola / 23000) * 100) / 100;

  return (
    <PayPalScriptProvider
      options={{
        clientId:
          "ATYQd4CEL4SonfbW4_AzQGfWW-iA3LDempkI3OcXqETgQr3fcvyBv6IACoC3_8vqmII2_vDLte1wfqrm",
        currency: "USD",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: usdAmount.toString(),
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            Swal.fire("Thanh toán thành công", "", "success");

            // Gửi dữ liệu nếu cần
            return fetch("/auth-home", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: data.orderID,
              }),
            });
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPal;
