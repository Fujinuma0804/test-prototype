# 麻雀DANRAN MVP Prototype

Vercel にデプロイ可能な Vite + React のWebアプリプロトタイプです。

## 機能範囲

- 個人成績表示
- ランキング（1種類：平均順位ベース）
- 対戦履歴
- ポイント表示
- 店舗側の簡易管理画面
  - 会員管理
  - 対戦入力
  - ポイント更新

## ローカル起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## テスト

```bash
npm test
```

## Vercel デプロイ手順

1. このフォルダをGitHubリポジトリへアップロード
2. Vercelで該当リポジトリをImport
3. Framework Preset は `Vite`
4. Build Command は `npm run build`
5. Output Directory は `dist`
6. Deploy

## 注意

このプロトタイプは画面・操作フロー確認用です。現在のデータはブラウザ上の状態管理で動作しており、リロードすると初期データに戻ります。本番化時はDB・ログイン・権限管理を追加します。
