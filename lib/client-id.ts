const CLIENT_ID_KEY = "weather_client_id";

export function getClientId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}
