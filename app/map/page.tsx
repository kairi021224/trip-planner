'use client';

import { useMemo, useState } from "react";
import MapView, { Spot } from "../components/MapView";

type AreaKey = "tokyo" | "kyoto" | "osaka";

const AREA_PRESETS: Record<
  AreaKey,
  { label: string; center: [number, number]; zoom: number }
> = {
  tokyo: { label: "東京エリア", center: [139.7671, 35.6812], zoom: 12 },
  kyoto: { label: "京都エリア", center: [135.7681, 35.0116], zoom: 13 },
  osaka: { label: "大阪エリア", center: [135.5000, 34.6937], zoom: 12 },
};

const MOCK_SPOTS: Record<AreaKey, Array<Spot & { tags?: string[] }>> = {
  tokyo: [
    {
      id: "tokyo-station",
      name: "東京駅",
      lat: 35.6812,
      lng: 139.7671,
      description: "JR各線のターミナル。散策の起点。",
      tags: ["街歩き", "グルメ"],
    },
    {
      id: "imperial-palace",
      name: "皇居外苑",
      lat: 35.6852,
      lng: 139.7528,
      description: "お濠沿いを散策できる緑地。",
      url: "https://www.env.go.jp/garden/kokyogaien/",
      tags: ["自然", "散歩"],
    },
    {
      id: "ginza",
      name: "銀座エリア",
      lat: 35.6717,
      lng: 139.765,
      description: "ショッピング・カフェが集まる街歩きスポット。",
      tags: ["街歩き", "グルメ"],
    },
    {
      id: "ueno-park",
      name: "上野公園",
      lat: 35.7148,
      lng: 139.7745,
      description: "美術館・動物園が集まる広い公園。",
      tags: ["自然", "文化"],
    },
  ],
  kyoto: [
    {
      id: "fushimi-inari",
      name: "伏見稲荷大社",
      lat: 34.9671,
      lng: 135.7727,
      description: "千本鳥居で有名な神社。",
      tags: ["文化", "散歩"],
    },
    {
      id: "kinkakuji",
      name: "金閣寺",
      lat: 35.0394,
      lng: 135.7292,
      description: "池に映る金閣が美しい世界遺産。",
      tags: ["文化", "景観"],
    },
    {
      id: "gion",
      name: "祇園・花見小路",
      lat: 35.0037,
      lng: 135.7788,
      description: "京町家が並ぶ風情ある花街。",
      tags: ["街歩き", "グルメ"],
    },
  ],
  osaka: [
    {
      id: "osaka-castle",
      name: "大阪城公園",
      lat: 34.6873,
      lng: 135.5259,
      description: "天守閣と広い公園で散策。",
      tags: ["散歩", "文化"],
    },
    {
      id: "dotonbori",
      name: "道頓堀",
      lat: 34.6677,
      lng: 135.5012,
      description: "ネオンとグルメで賑わう繁華街。",
      tags: ["グルメ", "街歩き"],
    },
    {
      id: "umeda-sky",
      name: "梅田スカイビル 空中庭園",
      lat: 34.7055,
      lng: 135.4892,
      description: "大阪市街を一望できる展望フロア。",
      tags: ["景観"],
    },
  ],
};

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function pickSpots(area: AreaKey, moodInput: string) {
  const tags = parseTags(moodInput);
  const candidates = MOCK_SPOTS[area];
  if (tags.length === 0) return candidates;

  const matched = candidates.filter(spot =>
    spot.tags?.some(tag => tags.includes(tag)),
  );

  // 該当がない場合は元の候補を返して空にならないようにする
  return matched.length > 0 ? matched : candidates;
}

export default function MapPage() {
  const [area, setArea] = useState<AreaKey>("tokyo");
  const [mood, setMood] = useState("");
  const [spots, setSpots] = useState<Spot[]>(MOCK_SPOTS.tokyo);
  const [center, setCenter] = useState<[number, number]>(AREA_PRESETS.tokyo.center);
  const [activeSpotId, setActiveSpotId] = useState<string | undefined>(spots[0]?.id);

  const currentArea = useMemo(() => AREA_PRESETS[area], [area]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSpots = pickSpots(area, mood);
    setCenter(currentArea.center);
    setSpots(nextSpots);
    setActiveSpotId(nextSpots[0]?.id);
  };

  return (
    <main className="grid h-screen grid-rows-[auto,1fr] bg-white">
      <section className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">旅行スポットを探す（デモ）</h1>
        <p className="text-sm text-gray-600">
          エリアと気分タグを選んで地図に反映します。実API接続時はこの部分で
          ジオコーディング＋スポット検索を呼び出す想定です。
        </p>
        <form
          onSubmit={handleSearch}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <label className="grid gap-1">
            <span className="text-sm font-medium">エリア</span>
            <select
              className="rounded border px-3 py-2"
              value={area}
              onChange={e => setArea(e.target.value as AreaKey)}
            >
              {Object.entries(AREA_PRESETS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 min-w-[240px]">
            <span className="text-sm font-medium">気分タグ（カンマ区切り）</span>
            <input
              className="rounded border px-3 py-2"
              placeholder="例: 自然, グルメ, 街歩き"
              value={mood}
              onChange={e => setMood(e.target.value)}
            />
            <span className="text-xs text-gray-500">
              一致するタグ優先で絞り込み。未一致なら代表スポットを表示。
            </span>
          </label>

          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            地図を更新
          </button>
        </form>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr,2fr]">
        <div className="border-r p-4">
          <h2 className="text-lg font-semibold">スポット一覧</h2>
          <ul className="mt-3 grid gap-3">
            {spots.map(spot => (
              <li
                key={spot.id}
                className={`rounded border p-3 ${
                  activeSpotId === spot.id ? "border-black" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{spot.name}</div>
                    {spot.description && (
                      <p className="text-sm text-gray-700">{spot.description}</p>
                    )}
                    {spot.url && (
                      <a
                        className="text-sm text-blue-600 underline"
                        href={spot.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        公式サイト
                      </a>
                    )}
                  </div>
                  <button
                    className="rounded border px-2 py-1 text-sm"
                    type="button"
                    onClick={() => setActiveSpotId(spot.id)}
                  >
                    地図で見る
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-[400px]">
          <MapView
            center={center}
            zoom={currentArea.zoom}
            spots={spots}
            activeSpotId={activeSpotId}
            onMarkerClick={setActiveSpotId}
          />
        </div>
      </section>
    </main>
  );
}
