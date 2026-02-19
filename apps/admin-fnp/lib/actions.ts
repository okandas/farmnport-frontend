import { authorizedHTTPClient } from "./axios"

export async function createBuyerContact(data: {
  client_id: string
  name: string
  phone: string
  alternative_phone?: string
  email?: string
  position?: string
  notes?: string
  status: "active" | "archived" | "banned"
}) {
  const response = await authorizedHTTPClient.post("/v1/admin/buyer-contacts", data)
  return response.data
}

export async function updateBuyerContact(id: string, data: {
  name?: string
  phone?: string
  alternative_phone?: string
  email?: string
  position?: string
  notes?: string
  status?: "active" | "archived" | "banned"
}) {
  const response = await authorizedHTTPClient.put(`/v1/admin/buyer-contacts/${id}`, data)
  return response.data
}

export async function deleteBuyerContact(id: string) {
  const response = await authorizedHTTPClient.delete(`/v1/admin/buyer-contacts/${id}`)
  return response.data
}
