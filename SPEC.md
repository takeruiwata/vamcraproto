# Vampire Crawlers Proto — SPEC

**最終更新: 2026-05-19**
**場所:** `D:\雑インストール\vampire-crawlers-proto\`

**移植目標:** スマホ (iOS/Android)。エンジン候補は **Godot 4** が本命。

このファイルは**セッション再開時に最初に読む**こと。終了時には必ず最新化する。

---

## ゲーム概要

Vampire Crawlers (poncle製、2026-04) のHTMLプロトタイプ。
ターンベースのデッキビルダー型ローグライト + **3D一人称ダンジョン探索**。

### モード遷移
1. タイトル画面 → ゲームスタート or テストモード
2. 特性選択 (2つ) → 出陣
3. **3Dダンジョン探索** (一人称, WASD+QE) — 敵接触で戦闘、シャベル拾うと自動降下
4. **戦闘** — マナ消費でカードプレイ、コンボで倍率、複数敵対応
5. レベルアップでカード追加 / 進化 (primary+secondary+💎ジェム)

---

## ファイル構成

```
D:\雑インストール\vampire-crawlers-proto\
├── index.html         画面構造
├── style.css          スタイル + アニメ
├── game.js            ゲームロジック (~2400行)
├── SPEC.md            ← このファイル
├── asset_prompts.txt  GPT image用プロンプト一覧
├── free_assets.txt    フリー素材ソース集
└── assets\            画像/SVG/テクスチャ
    ├── player.png     (ユーザー生成)
    ├── shovel.svg     (game-icons lorc/spade)
    ├── chest.png      (ユーザー生成)
    ├── enemy_*.svg    (game-icons CC BY 3.0)
    ├── card_*.svg     (game-icons CC BY 3.0)
    ├── wall.png       (polyhaven brick_wall_001 CC0)
    ├── floor.png      (polyhaven cobblestone_floor_03 CC0)
    ├── wall_stone/wood/iron.png  (代替壁テクスチャ)
    ├── floor_dirt/wood.png       (代替床テクスチャ)
    └── fx/<name>.webm (透過動画エフェクト/任意)
```

---

## 現状の実装 (v10時点)

### 探索モード (3D一人称)
- **Wolfenstein風レイキャスター3Dビュー** (720×420 canvas)
- 壁テクスチャ (wall.png) を slice mapping で各レイに貼付
- 床テクスチャ (floor.png) を createPattern でタイル
- 敵/宝箱/シャベル: **ビルボードSVGスプライト** (drawImage)
  - 距離シェード (filter brightness + drop-shadow グロー)
  - line-of-sight + Zバッファ可視カラム率35%以上で表示
  - ctx.clip()で壁の隙間に綺麗にクリップ
- **ミニマップ** (14px/マス) 下部にMAPラベル付き
- WASD = 前進/後退/横歩き (向き相対)
- Q/E = 左右90°回転
- シャベル踏むと自動的に descend-out → nextFloor → ascend-in アニメ

### ダンジョン生成
- **部屋+L字通路型** (BSP風)
  - 5-8部屋 (小2-4 / 大4-6)
  - 大部屋には30%で柱(壁ブロック)
  - 各部屋を中心線で接続、30%で追加ループ
  - 入口(1,1)が必ず最初の部屋に通じる

### 戦闘モード (複数敵対応)
- **最大10列のフォーメーション** (各列3体、フロア進行で増)
- 常に表示は **3列まで**: 前列(大) / 中列(小) / 奥列(極小)
- 前列全滅で**スライド昇格アニメ**:
  - 中→前: scale 0.75→1.0 でヌルっと前進
  - 奥→中: scale 0.667→1.0
  - 隠れ列→奥: フェードイン
- **前列のみがプレイヤー攻撃** (中/奥は待機)
- 敵撃破は DOM 完全削除
- XP = トリガー敵1体分のみ加算 (全部加算しない)

### カードシステム (50種+)
- マナポイント制 (毎ターン6マナ自動回復、カードはマナ消費)
- マナ昇順コンボで ×1.5 倍率 (Combo Master trait で ×1.75)
- **Wild仕様**: lastMana を-1にリセット、次が何でも繋がる
- 全カードに15%でWildタグ
- Targeting:
  - `single`: 前列の左端1体
  - `aoe`: 前列のみ全滅させると次列にカスケード
- **進化システム**: primary + secondary + 💎ジェム = 進化版 (17レシピ、VC Wiki準拠)
- ジェムはボス撃破/レア宝箱で入手

### 特性 (Trait) 8種
開始時2個選択
- 🛡️ Iron Skin / 🗡️ Combo Master / 🔥 Pyromancer / 🧛 Lifesteal
- ❤️ Tough / 🔮 Mana Pool / 🍀 Lucky / ✨ Sage

### 敵 (VC Wiki準拠)
- 25種通常 + 7ボス (Mad Forest→Inlaid Library→...→Cappella Magna)
- 特殊能力: heal/revive/reflect/curse/berserk/split/disguise(Mimic)
- 5階毎ボス、ボス撃破で💎+1

### カード別ビジュアルエフェクト
カード毎に `fx` 種別を指定:
- **slash**: 斜め斬撃の白光 (剣系)
- **lightning**: SVG ジグザグ稲妻+画面フラッシュ (雷系)
- **fire**: 立ち昇る炎柱 (火系)
- **shockwave**: 同心円衝撃波 (爆発系)
- **beam**: 上から光柱 (聖系)
- **drain**: 敵→HPへ吸魂オーブ (吸収系)
- **wind**: 横方向風切り線 (翼系)
- **spiral**: 回転拡大リング (渦系)
- **fog**: 円形靄 (闇/呪系)
- **projectile**: 投擲モーション (knife/cherry_bomb等は projectile→impact)
- 各カードに専用SE (knife/fire/zap/bell/swish/boom/drain/swirl/whoosh)

### 透過動画エフェクト対応
`assets/fx/<エフェクト名>.webm` あれば自動で動画再生 (CSSエフェクト代わりに)
対応名: `slash` `lightning` `fire` `shockwave` `beam` `wind` `spiral` `fog`

### ジュース演出
- ダメージ数字: サイズ可変 + 50+で虹色サイクル
- パーティクル: カード別emoji
- 画面フラッシュ (色付き)、カットイン (CRITICAL/COMBO/JACKPOT/EXECUTE)
- 9連コンボでJACKPOT、12連以降でGODLIKEパーティクル
- 勝利時コインシャワー (通常25/ボス80粒)
- ヒットストップ (大ダメ70ms、EXECUTE 150ms)

### テストモード
- プレイヤー: 開始フロア/Lv/HP/マナ/カード倍率/開始ブロック/💎/手札サイズ/全特性
- 敵: HP倍率/ATK倍率/編成列数(1-10)
- カスタムデッキ (クリックで追加、右クリックで削除)
- 敵プール選択 (チップ式)、ボス選択
- 戦闘テスト: ドロップダウンで対戦相手1体選んで即戦闘 → 終わったら設定画面に戻る
- カードホバーで詳細tooltip (テストモード時のみ)

### アセット
- **game-icons.net (CC BY 3.0)**: SVG 111枚 (カード/敵/ボス/アイテム)
  - 黒背景rect自動除去済
  - 投影色glowで距離感
- **Poly Haven (CC0)**: テクスチャ7枚 (brick/stone/wood/iron walls, cobble/dirt/wood floors)
- **Web Audio合成**: 全SE+BGM (外部音源なし)
- 表記必須: `Icons by game-icons.net (CC BY 3.0)` (タイトル画面下部に記載済)

---

## 操作

**タイトル:** マウスクリック

**探索 (3D):**
- W/S: 前進/後退
- A/D: 左/右に横歩き
- Q/E: 左/右90°回転
- 🪏拾うと自動次階層 (SPACE不要)

**戦闘:**
- カードクリック / 1〜5キー: カードプレイ
- Enterボタン: ターン終了
- 逃走ボタン: -3HP

---

## 起動

```powershell
& "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe" "file:///D:/雑インストール/vampire-crawlers-proto/index.html"
```

---

## 既知の解決済みバグ
- ミニスライム撃破後に元スライム残留
- マナ0コンボ起点
- 敵ATK 0 (debuff下限1で修正)
- 3列目に当たり判定漏れ (aoe範囲調整)
- スプライトが壁透過 (line-of-sight + per-column z-buffer + clip())
- スプライト断片化 (per-column slicing → majority-visible+clip方式に変更)
- フロア生成が正方形すぎ (部屋+通路型生成に変更)

---

## TODO / 次回検討

### 短期
- **バランス調整**: 複数敵+10列でプレイテスト後、HP/ダメ/敵数のチューニング
- フロア毎にテクスチャ切り替え (wall_stone, wall_wood, wall_iron など使い分け)
- 3Dビューに**プレイヤーの手・武器表示** (Wizardry風)

### 中期
- ボス戦の3D演出強化 (ボスは画面いっぱい+演出)
- 階段イベント (シャベル以外の進行手段)
- レアアイテム/装備品
- アンロックシステム (新カード/特性)

### 長期
- **Godot 4 移植** (TileMap → Sprite2D → Control → AudioStreamPlayer)
- スマホ向けタッチ操作
- 課金/広告 (Godot AdMob プラグイン)
- itch.io / Steam 配信

---

## 重要メモ

- ブラウザ起動は **Brave** を明示指定 [[feedback-default-browser]]
- 仕様不明点はユーザーに聞く (本人がVC本家プレイ済み、勘違い修正多数あり)
- アセット未配置時は絵文字フォールバックで動く設計を維持
