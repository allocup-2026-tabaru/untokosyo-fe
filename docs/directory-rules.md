# ディレクトリ構造・命名規則

## ディレクトリ構造の全体像

```
src/
├── app/              # ルーティング定義のみ（Next.js App Router）
├── features/         # ドメイン単位の機能実装
├── components/       # 複数 feature をまたぐ共通コンポーネント
├── shared/           # 型・hooks・ユーティリティの共通定義
└── infrastructure/   # 外部通信（HTTP・WebSocket）
```

---

## 判断フロー

### 新しいコンポーネントをどこに置くか

```
新しいコンポーネントを作る
        │
        ▼
複数の feature から使われる？（または使われる見込みがある？）
        │
   YES ─┼─ NO
        │          │
        ▼          ▼
 components/    どの feature の話？
     └─ ui/         │
        に置く       ▼
              features/<name>/components/
                  に置く
```

> **迷ったら features/ に置く。** 後から複数 feature で使われるようになったとき `components/` に昇格させればよい。最初から `components/` に置く必要はない。

---

### 新しいファイルをどこに置くか（コンポーネント以外）

```
新しいファイルを作る
        │
        ▼
カスタム hooks？
   YES → 複数 feature で使う？
             YES → shared/hooks/
             NO  → features/<name>/hooks/
   NO  ↓
定数・設定値？
   YES → 複数 feature で使う？
             YES → shared/constants/（または shared/utils/）
             NO  → features/<name>/constants/
   NO  ↓
型定義？
   YES → 複数 feature で共有する型？
             YES → shared/types/
             NO  → features/<name>/types/ または同一ファイル内に定義
   NO  ↓
API・WebSocket などの外部通信？
   YES → infrastructure/ に置く
```

---

### page.tsx に何を書くか

```
page.tsx に書こうとしているものがある
        │
        ▼
metadata（title等）の定義？
   YES → page.tsx に書いてよい
   NO  ↓
params / searchParams の受け取り？
   YES → page.tsx に書いてよい（feature へ渡すだけ）
   NO  ↓
JSX・useState・useEffect・API コール？
   YES → features/<name>/components/ に切り出す
         page.tsx はそのコンポーネントを呼ぶだけにする
```

**page.tsx の正しい例:**

```tsx
// app/[roomId]/page.tsx
import { RoomPage } from "@/features/room/components/RoomPage";

export default async function RoomRoutePage({ params }: Props) {
  const { roomId } = await params;
  return <RoomPage roomId={roomId} />;
}
```

**page.tsx のNG例:**

```tsx
// ❌ JSX を直書きしている
export default function GamePage() {
  return (
    <main className="...">
      <h1>ゲーム画面</h1>
      ...
    </main>
  );
}
```

---

## 各ディレクトリの役割と禁止事項

### `app/`

| OK | NG |
|---|---|
| metadata のエクスポート | JSX の直書き |
| params を受け取り feature へ渡す | useState / useEffect の使用 |
| layout.tsx でのレイアウト定義 | API コール |

### `features/`

- **1 ドメイン = 1 ディレクトリ**（`lobby/`, `room/`, `controller/` など）
- feature 内の部品の粒度は問わない（小さいコンポーネントも大きいコンポーネントも同じ feature に置いてよい）
- **feature 間の import は禁止。** `features/room/` が `features/lobby/` を import するのはNG

```
features/<name>/
├── components/       # この feature のコンポーネント（全粒度）
│   └── layout/       # レイアウト系（必要な場合のみ）
├── hooks/            # この feature 専用のカスタム hooks
├── constants/        # この feature 専用の定数
├── types/            # この feature 専用の型（外部共有しない）
└── scene/            # R3F シーン（3D 機能がある場合）
```

### `components/`

- **置く条件:** 2 つ以上の feature から使われるもの、または feature に依存しない汎用 UI
- `components/` は `features/` を **import しない**

```
components/
├── ui/               # 汎用 UIパーツ（Panel, ModalOverlay 等）
└── <name>/           # まとまりのある共通コンポーネント群
```

### `shared/`

- `components/` も `features/` も **import しない**
- 純粋な型・関数・hooks のみ

### `infrastructure/`

- UI に依存しない通信ロジックのみ
- React コンポーネントを **import しない**

---

## import の方向（依存ルール）

```
app/  →  features/  →  components/  →  shared/
                    ↘               ↗
                     infrastructure/
```

**上位から下位への一方通行のみ許可。逆方向・横方向は禁止。**

---

## 命名規則

### ファイル名

| 対象 | 規則 | 例 |
|---|---|---|
| React コンポーネント | PascalCase | `RoomModal.tsx` |
| カスタム hooks | camelCase、`use` prefix | `useCreateRoom.ts` |
| ユーティリティ・定数 | camelCase | `lobbyRoom.ts` |
| 型定義ファイル | camelCase | `participant.ts` |
| CSS ファイル | コンポーネントと同名 | `BackGroundModel.css` |

### ディレクトリ名

| 対象 | 規則 | 例 |
|---|---|---|
| `features/` 配下 | kebab-case | `ground-dig-model/` |
| `components/` 配下 | kebab-case | `ground-dig-model/` |
| `app/` 配下 | Next.js の規則に従う | `[roomId]/`, `(lobby)/` |

> **PascalCase のディレクトリは禁止。** すべて kebab-case。

### コンポーネント名と export スタイル

- **ファイル名とコンポーネント名は必ず一致させる**
  - `Arrow.tsx` に `PullArrowIndicator` を定義するのは NG
- **named export を使う**（Next.js が要求するファイルを除く）

| ファイル | export スタイル |
|---|---|
| `page.tsx`, `layout.tsx` | `export default`（Next.js 要件） |
| それ以外すべて | `export function Foo` （named export） |

---

## よくある迷いと答え

**Q. feature 内の小さいコンポーネントも `components/` に置いていい？**
A. NG。その feature にしか使わないなら `features/<name>/components/` に置く。

**Q. feature をまたいで使いたくなったらどうする？**
A. `components/ui/` または `components/<name>/` に移動して named export で公開する。

**Q. `features/lobby/components/layout/LobbyPanel.tsx` のように、`components/ui/Panel` をそのまま薄くラップしたコンポーネントを feature 内に作っていい？**
A. NG。ラップしただけで機能差分がないコンポーネントは作らない。直接 `components/ui/Panel` を使う。

**Q. feature 間で同じようなロジック（hooks）が生まれたら？**
A. `shared/hooks/` に昇格させる。コピペで両 feature に置かない。
