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
- ✅ **Phase 2: 音声録音機能** - 完了
- ✅ **Phase 3: バックエンドAPI実装** - 完了
- ✅ **Phase 4: クライアント統合（API連携）** - 完了
- ✅ **Phase 5: UI実装** - 完了
- ✅ **Phase 6: 通知機能** - 完了
- 🎉 **MVPコアフロー完成！**
- ⏳ Phase 7: テスト・バグ修正
- ⏳ Phase 8: ビルド・配布準備
- ⏳ Phase 9: リリース準備

### 現在の状態

**録音 → AI整理 → "預かりました" → 通知1回** の全てが動作中！

実際の動作例：
```
1. 音声録音: "明日中にオクトパスに問い合わせをする"
2. AI整理:
   - 要約: "オクトパスに問い合わせ"
   - 分類: "仕事"
   - 通知時刻: 翌日9:00
3. 完了画面表示: "預かりました"
4. 通知スケジュール完了
```

## 主要機能

### 実装済み
- ✅ 音声録音（expo-av）
- ✅ OpenAI Whisper API（音声→テキスト変換）
- ✅ OpenAI GPT-4o（AI整理: 要約・分類・リマインド時刻提案）
- ✅ ローカル通知（expo-notifications）
- ✅ エンドツーエンドのエラーハンドリング

### 技術的特徴
- TypeScript完全対応
- React Native + Expo（Managed Workflow）
- Node.js + Express バックエンド
- FormDataによる音声ファイルアップロード
- タイムアウト制御（30秒）
- 過去時刻の自動補正

## ドキュメント

- `requirements.md` - 詳細な要件定義
- `DEVELOPMENT_PLAN.md` - 開発計画書（20日間の詳細スケジュール）
- `CLAUDE.md` - Claude Code用のガイドライン

## トラブルシューティング

### iPhoneからサーバーに接続できない場合
サーバーが0.0.0.0でリッスンしているか確認してください：
```bash
# server/index.js で以下が設定されていることを確認
app.listen(PORT, '0.0.0.0', () => { ... });
```

### OpenAI APIエラーが発生する場合
`.env`ファイルにAPIキーが正しく設定されているか確認してください。

## ライセンス

Private
