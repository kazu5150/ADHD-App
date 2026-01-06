# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ 重要：必ず参照すべきファイル

このプロジェクトで作業する際は、以下のファイルを**必ず参照**してください：

1. **`requirements.md`** - プロジェクトの要件定義書
   - プロジェクトの目的・想定ユーザー・提供価値
   - 機能要件と非機能要件
   - やらないこと（スコープ外）の明確な定義
   - 設計思想とコアコンセプト

2. **`DEVELOPMENT_PLAN.md`** - 綿密な開発計画書
   - 20日間の開発フェーズ詳細
   - API設計・データモデル・UI/UXフロー
   - ファイル構造・環境設定
   - テスト計画・デプロイ計画
   - リスクと対応策

**これらのファイルを読まずに開発を進めないでください。**

---

## プロジェクト概要

**脳の一時置き場** - ADHD傾向のある人が思考を即座に退避させ、「今」に集中できる状態を作るアプリ

### コアコンセプト
- タスク管理ではなく「思考の退避」
- 整理はAIが行い、ユーザーは判断しない
- アプリを閉じた後に価値が発生する設計
- **リリース目標：今月末**

## 技術スタック

### クライアント（iOS）
- **フレームワーク**: React Native + Expo (TypeScript, Managed Workflow)
- **音声録音**: expo-av
- **通知**: expo-notifications
- **API通信**: fetch（追加ライブラリなし）
- **ストレージ**: AsyncStorage（最小限）

### バックエンド
- **ランタイム**: Node.js + Express
- **AI処理**: OpenAI API（音声transcribe + chat/completions）
- **重要**: APIキーは必ずバックエンドで管理（クライアントに含めない）

### インフラ（MVP）
- **ホスティング**: Render / Fly.io / Railway 等
- **DB**: MVPでは使用しない（保存は最小限）
- **配布**: TestFlight → App Store (EAS Build使用)

## 開発コマンド

### クライアント（React Native）
```bash
# 依存関係インストール
cd client
npm install

# 開発サーバー起動（Expo Go）
npx expo start

# iOS シミュレータで起動
npx expo start --ios

# ビルド（TestFlight配布用）
eas build --platform ios
```

### バックエンド（Node.js）
```bash
# 依存関係インストール
cd server
npm install

# 開発サーバー起動
npm run dev

# 本番起動
npm start
```

## アーキテクチャ

### MVPのゴール
「録音 → AI整理 → "預かりました" → 通知1回」を通すこと

### データフロー
1. **音声入力** (expo-av) → 録音ファイル
2. **音声→テキスト** (OpenAI Whisper API) → バックエンド経由
3. **AI整理** (OpenAI GPT) → 要約（1行）+ 4分類 + リマインド時刻提案
4. **退避完了** → 「預かりました」メッセージ表示
5. **通知** (expo-notifications) → 指定時刻に1件のみ

### 非機能要件（重要）
- 起動〜録音開始まで **3秒以内**
- 操作ステップは **最大2タップ**
- UI：白/淡色ベース、情報量最小、静かなアニメーション
- バッジ・未処理数表示は**なし**

## ディレクトリ構造（予定）

```
ADHD-App/
├── client/              # React Native アプリ
│   ├── App.tsx         # エントリーポイント
│   ├── screens/        # 画面コンポーネント
│   ├── components/     # 再利用可能コンポーネント
│   ├── services/       # API通信、音声録音等
│   └── types/          # TypeScript型定義
│
├── server/             # Node.js バックエンド
│   ├── index.js        # Express サーバー
│   ├── routes/         # APIエンドポイント
│   └── services/       # OpenAI連携等
│
└── requirements.md     # 詳細要件定義
```

## 設計原則

### やること
- 音声入力からAI整理までを最短で実装
- シンプルなUI（標準コンポーネントのみ）
- OpenAI APIキーの安全な管理（バックエンド経由）

### やらないこと（MVP）
- タスク管理機能
- 一覧・検索・タグ管理
- データベース設計
- 精緻なUI設計
- 継続利用を煽る通知
- 成果・成長の可視化

## 重要な制約

1. **セキュリティ**: OpenAI APIキーは絶対にクライアントに含めない
2. **パフォーマンス**: 3秒以内の起動を死守
3. **UX**: 「もう頭で持たなくていい」という体験を最優先
4. **スコープ**: 今月末リリースのため、機能を最小限に絞る

## 参照ドキュメント

- 詳細な要件: `requirements.md`
- Apple Developer: App Store Connect / TestFlight
- Expo: https://docs.expo.dev/
- OpenAI API: https://platform.openai.com/docs/
