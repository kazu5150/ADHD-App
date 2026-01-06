# 脳の一時置き場

ADHD傾向のある人が、頭の中の思考を即座に退避させ、「今」に集中できる状態を作るアプリ

## プロジェクト概要

- **目的**: タスク管理ではなく「思考の退避」
- **コアコンセプト**: 整理はAIが行い、ユーザーは判断しない
- **リリース目標**: 2026年1月末

## 技術スタック

### クライアント（iOS）
- React Native + Expo (TypeScript)
- expo-av（音声録音）
- expo-notifications（通知）

### バックエンド
- Node.js + Express
- OpenAI API（音声→テキスト変換、AI整理）

## セットアップ

### 必要なツール
- Node.js 18.x以上
- npm 9.x以上
- Expo CLI
- iPhone（実機テスト用）

### インストール

#### 1. クライアント
```bash
cd client
npm install
```

#### 2. バックエンド
```bash
cd server
npm install
```

#### 3. 環境変数設定
```bash
cd server
cp .env.example .env
# .envファイルを編集してOpenAI APIキーを設定
```

## 開発サーバー起動

### クライアント（React Native）
```bash
cd client
npx expo start
```

その後、iPhoneでExpo Goアプリを使ってQRコードをスキャン

### バックエンド（Node.js）
```bash
cd server
npm run dev
```

ヘルスチェック: http://localhost:3000/health

## 開発フェーズ

- ✅ **Phase 1: 環境構築** - 完了
- ⏳ Phase 2: 音声録音機能
- ⏳ Phase 3: バックエンドAPI実装
- ⏳ Phase 4: クライアント統合
- ⏳ Phase 5: UI実装
- ⏳ Phase 6: 通知機能実装

## ドキュメント

- `requirements.md` - 詳細な要件定義
- `DEVELOPMENT_PLAN.md` - 開発計画書（20日間の詳細スケジュール）
- `CLAUDE.md` - Claude Code用のガイドライン

## ライセンス

Private
