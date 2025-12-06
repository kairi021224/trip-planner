'use client';

import { useState } from 'react';

type FormValues = {
  origin: string;
  days: number;
  mood: string; // カンマ区切り: "自然, 温泉"
  budget: number;
};

type DraftPlan = {
  title: string;
  days: Array<{ day: number; places: string[] }>;
};

function makeDraftPlan(v: FormValues): DraftPlan {
  // いまはダミー生成（後でAPIと地図に差し替える）
  const moods = v.mood
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const baseSpots =
    moods.length > 0
      ? moods.map((m, i) => `${m}スポットA${i + 1}`)
      : ['散策スポットA', 'カフェB', '景観C'];

  const days: DraftPlan['days'] = Array.from({ length: v.days }).map((_, i) => ({
    day: i + 1,
    places: baseSpots.slice(0, Math.min(3, baseSpots.length)),
  }));

  return {
    title: `${v.origin}発 ${v.days}日間の仮プラン`,
    days,
  };
}

export default function Page() {
  const [values, setValues] = useState<FormValues>({
    origin: '',
    days: 2,
    mood: '',
    budget: 30000,
  });
  const [plan, setPlan] = useState<DraftPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.origin.trim()) {
      setError('出発地を入力してください（例：東京）');
      return;
    }
    if (values.days < 1 || values.days > 14) {
      setError('日数は1〜14の範囲で指定してください');
      return;
    }

    const p = makeDraftPlan(values);
    setPlan(p);
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Trip Planner (MVP)</h1>
      <p className="text-sm text-gray-600 mt-2">
        条件を入れて「仮の旅程」を作ります（のちほど地図＆APIに接続）。
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">出発地</span>
          <input
            className="border rounded px-3 py-2"
            placeholder="例: 東京 / 仙台 / 大阪"
            value={values.origin}
            onChange={(e) => setValues(v => ({ ...v, origin: e.target.value }))}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">日数</span>
            <input
              className="border rounded px-3 py-2"
              type="number"
              min={1}
              max={14}
              value={values.days}
              onChange={(e) => setValues(v => ({ ...v, days: Number(e.target.value) }))}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">予算（円）</span>
            <input
              className="border rounded px-3 py-2"
              type="number"
              min={0}
              step={1000}
              value={values.budget}
              onChange={(e) => setValues(v => ({ ...v, budget: Number(e.target.value) }))}
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-sm font-medium">気分タグ（カンマ区切り）</span>
          <input
            className="border rounded px-3 py-2"
            placeholder="例: 自然, 温泉, 街歩き, グルメ"
            value={values.mood}
            onChange={(e) => setValues(v => ({ ...v, mood: e.target.value }))}
          />
          <span className="text-xs text-gray-500">
            例「自然, 温泉」と入れると関連スポットを優先（いまはダミー）
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="bg-black text-white rounded px-4 py-2 w-fit"
        >
          プランを作る（仮）
        </button>
      </form>

      {plan && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">{plan.title}</h2>
          <div className="mt-3 grid gap-3">
            {plan.days.map(d => (
              <div key={d.day} className="border rounded p-3">
                <div className="font-medium">Day {d.day}</div>
                <ul className="list-disc pl-5">
                  {d.places.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ※ 今はダミー生成。次のステップで地図・API（OpenTripMap）と連携して実データ化します。
          </p>
        </section>
      )}
    </main>
  );
}
