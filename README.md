# Vampire Crawlers Proto

ターンベースのデッキビルダー型ローグライト + 3D一人称ダンジョン探索。
Vampire Crawlers (poncle, 2026) インスパイアの HTML/JS プロトタイプ。

## 操作

- **W/A/S/D** — 移動 (前進/後退/横歩き、向き相対)
- **Q/E** — 左右90°回転
- **戦闘中**: カードクリック or **1〜5キー** でカード使用
- **Enter** — ターン終了
- 🪏 シャベルを拾うと自動で次階層へ
- 5階のシャベルは死神を召喚 (勝っても負けても次ステージへ)

## 主な機能

- **8ステージ × 5フロア** + 永続ループ (NEW GAME+) で無限スケーリング
- 50+カード、進化レシピ17種、特性8種から2つ選択
- 複数敵フォーメーション (最大10列、3列ずつ表示、列突破で前進)
- カード別ビジュアルエフェクト (slash/lightning/fire/shockwave 等)
- 弾数強化カード (Multi Shot / Tri Bullet / Bullet Storm)
- テストモード (敵HP/ATK/編成/プレイヤーステータス カスタム)
- デバッグモード (全ステージ開放 + プレイヤー強化)
- 経験値テーブル: Pokemon "Medium Fast" (N³)

## 技術スタック

- Vanilla JavaScript / HTML5 Canvas / CSS3
- Web Audio API による合成SE/BGM
- ローカル localStorage で進行保存

## アセット・クレジット

- **アイコン**: [game-icons.net](https://game-icons.net/) (CC BY 3.0)
  - Authors: Lorc, Delapouite, Skoll, sbed et al.
- **テクスチャ**: [Poly Haven](https://polyhaven.com/) (CC0)
- **ゲーム/設定インスピレーション**: Vampire Crawlers by poncle

## ライセンス

ソースコード: MIT (好きに使ってOK)
アセット: 上記元ライセンスに従う

## ローカル実行

`index.html` をブラウザで開くだけ。ビルドプロセス不要。

```
start index.html
```

Brave / Chrome / Firefox / Edge 推奨。
