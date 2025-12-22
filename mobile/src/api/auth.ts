import { config } from "../config";
import { getOrCreateDeviceId, setToken } from "../storage/auth";

export type LoginResponse = {
  token: string;
  device_id: string;
  user: { id: number; name: string; email: string };
};

export async function login(params: {
  email: string;
  password: string;
  device_name?: string;
  platform?: string;
}): Promise<LoginResponse> {
  const device_id = await getOrCreateDeviceId();

  const res = await fetch(`${config.apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      device_id,
      device_name: params.device_name,
      platform: params.platform,
    }),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    let msg = `Login failed (${res.status})`;
    try {
      const parsed = JSON.parse(bodyText);
      msg = parsed?.message ?? msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const data = JSON.parse(bodyText) as LoginResponse;
  await setToken(data.token);
  return data;
}
