import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

const DEVICE_KEY = "ttd_device_id";
let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      "dev_" +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);
    await AsyncStorage.setItem(DEVICE_KEY, id);
  }
  cachedDeviceId = id;
  return id;
}

export type Era = {
  id: string;
  name: string;
  year: string;
  scenario: string;
  teaser: string;
  danger: number;
  tier: "free" | "premium";
  image: string;
};

export type Item = {
  id: string;
  name: string;
  icon: string;
};

export type JudgeResult = {
  id: string;
  survived: boolean;
  survival_score: number;
  narrative: string;
  twist: string;
  verdict: string;
  era_id: string;
  era_name: string;
  item_id: string;
  item_name: string;
  plan: string;
  created_at: string;
};

export type GameRecord = JudgeResult & { device_id?: string };

export type Stats = {
  total_games: number;
  survival_rate: number;
  best_score: number;
  current_streak: number;
  legendary_count: number;
};

export async function fetchEras(): Promise<Era[]> {
  const { data } = await api.get("/eras");
  return data.eras;
}

export async function fetchItems(): Promise<Item[]> {
  const { data } = await api.get("/items");
  return data.items;
}

export async function judge(
  era_id: string,
  item_id: string,
  plan: string
): Promise<JudgeResult> {
  const device_id = await getDeviceId();
  const { data } = await api.post("/judge", {
    device_id,
    era_id,
    item_id,
    plan,
  });
  return data;
}

export async function fetchGames(): Promise<GameRecord[]> {
  const device_id = await getDeviceId();
  const { data } = await api.get("/games", { params: { device_id } });
  return data.games;
}

export async function fetchStats(): Promise<Stats> {
  const device_id = await getDeviceId();
  const { data } = await api.get("/stats", { params: { device_id } });
  return data;
}

export async function clearGames(): Promise<void> {
  const device_id = await getDeviceId();
  await api.delete("/games", { params: { device_id } });
}
