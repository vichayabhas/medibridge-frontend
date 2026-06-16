import { getBackendUrl } from "@/components/utility/setup";
import { OrderStatus, OrderType } from "../../../interface";
import { Id } from "../../../configTypes";

export default async function updateOrderStatus(
  status: OrderStatus,id:Id
): Promise<OrderType[]> {
  const response = await fetch(`${getBackendUrl()}/order/updateOrderStatus/${id}`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return await response.json();
}
