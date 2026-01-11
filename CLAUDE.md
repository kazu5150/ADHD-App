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
- 開発計画書: `DEVELOPMENT_PLAN.md`
- プロジェクト概要: `README.md`
- Apple Developer: App Store Connect / TestFlight
- Expo: https://docs.expo.dev/
- OpenAI API: https://platform.openai.com/docs/

---

## 開発進捗状況（2026年1月6日時点）

### ✅ Phase 1: 環境構築 - 完了

**完了日**: 2026年1月6日

#### 実施内容

1. **プロジェクト作成**
   - React Native + Expo（TypeScript）プロジェクト作成
   - Node.js + Express バックエンド構築
   - 必要なパッケージインストール完了
     - クライアント: expo-av, expo-notifications, @react-native-async-storage/async-storage
     - サーバー: express, cors, multer, openai, dotenv, nodemon

2. **基本ファイル構造作成**
   ```
   ADHD-App/
   ├── client/
   │   ├── screens/
   │   ├── components/
   │   ├── services/
   │   ├── types/
   │   │   ├── memo.ts          # メモ型定義
   │   │   └── api.ts           # API型定義
   │   └── constants/
   │       ├── colors.ts        # カラーテーマ
   │       └── config.ts        # アプリ設定
   ├── server/
   │   ├── index.js             # Express サーバー（ヘルスチェック実装済み）
   │   ├── routes/
   │   ├── services/
   │   ├── middleware/
   │   ├── .env                 # 環境変数（Git管理外）
   │   └── .env.example         # 環境変数テンプレート
   ├── .gitignore
   ├── CLAUDE.md
   ├── DEVELOPMENT_PLAN.md
   ├── requirements.md
   └── README.md
   ```

3. **動作確認完了**
   - ✅ クライアント起動確認（iPhone実機でExpo Goアプリ使用）
   - ✅ バックエンド起動確認（http://localhost:3000/health でヘルスチェック成功）
   - ✅ デフォルトアプリ画面が表示される

4. **Gitリポジトリ管理**
   - リポジトリ初期化完了
   - .gitignore設定（node_modules, .env等）
   - コミット履歴:
     ```
     33dfa53 Add: README.md追加（Phase 1動作確認完了）
     7383106 Update: Phase 1本文のチェックボックスも完了
     b0e338c Update: Phase 1チェックリスト完了
     e03103e Initial commit: Phase 1 環境構築完了
     ```

#### 完了基準の達成状況

- ✅ `npx expo start`でアプリが起動する
- ✅ `npm start`でバックエンドが起動する
- ⏳ クライアントからバックエンドへのAPI通信（Phase 3以降で実装予定）

### ✅ Phase 2: 音声録音機能の実装 - 完了

**完了日**: 2026年1月11日

#### 実施内容

1. **音声録音サービス実装**
   - `client/services/audioRecorder.ts` 作成
   - expo-avを使用した録音開始/停止機能
   - 録音権限取得実装
   - 録音ファイルURI取得
   - エラーハンドリング実装

2. **権限設定**
   - `client/app.json` 更新
   - iOS: NSMicrophoneUsageDescription 追加
   - Android: RECORD_AUDIO 権限追加

3. **App.tsx統合**
   - 録音機能をApp.tsxに統合
   - デモデータから実際の録音処理に置き換え
   - 録音状態管理追加

#### 動作確認完了

- ✅ 音声録音権限取得
- ✅ 録音開始/停止
- ✅ 録音ファイルURI取得（.m4a形式）
- ✅ エラーハンドリング

### ✅ Phase 3: バックエンドAPI実装 - 完了

**完了日**: 2026年1月11日

#### 実施内容

1. **ファイルアップロード処理実装**
   - `server/middleware/upload.js` 作成
   - multerでメモリストレージ設定
   - ファイルサイズ制限（10MB）
   - 音声形式バリデーション（m4a, wav, mp3, mp4）
   - エラーハンドリング実装

2. **OpenAI API連携実装**
   - `server/services/openaiService.js` 作成
   - Whisper API統合（音声→テキスト変換）
   - GPT-4o統合（要約・分類・リマインド時刻提案）
   - タイムアウト設定（30秒）
   - JSON Mode使用でレスポンス安定化

3. **APIエンドポイント実装**
   - `server/routes/processVoice.js` 作成
   - POST /api/process-voice エンドポイント
   - 処理フロー: ファイル受信 → Whisper → GPT → レスポンス
   - エラーレスポンス（400/503/500）

4. **サーバー更新**
   - `server/index.js` にルート追加
   - 起動メッセージに新エンドポイント表示

#### 動作確認完了

- ✅ サーバー起動成功（http://localhost:3000）
- ✅ ヘルスチェック正常（GET /health）
- ✅ エラーハンドリング動作確認
  - ファイル未送信 → 400 NO_FILE
  - 不正なファイル形式 → 400 INVALID_FILE_TYPE

#### 注意事項

⚠️ **OpenAI APIキーの設定が必要**
- 現在 `.env` のAPIキーは `sk-proj-placeholder`（プレースホルダー）
- 実際のテストには https://platform.openai.com/ で取得したAPIキーが必要
- `.env` ファイルの `OPENAI_API_KEY` を実際のキーに置き換えること

### ✅ Phase 4: クライアント統合（API連携） - 完了

**完了日**: 2026年1月11日

#### 実施内容

1. **API通信サービス実装**
   - `client/services/apiClient.ts` 作成
   - 音声ファイルアップロード機能（FormData）
   - タイムアウト制御（30秒）
   - エラーハンドリング（ネットワークエラー、タイムアウト等）
   - ヘルスチェック機能

2. **API URL設定**
   - `client/constants/config.ts` 更新
   - 開発環境: MacのローカルIP（172.20.10.2）
   - iPhoneからアクセス可能な設定

3. **App.tsx更新**
   - デモデータから実際のAPI呼び出しに置き換え
   - 過去時刻チェック追加
   - エラーハンドリング強化（リトライボタン付き）

4. **サーバー側修正**
   - `server/index.js`: 0.0.0.0でリッスン（iPhone接続可能に）
   - `server/services/openaiService.js`: 未来時刻提案の強化、過去時刻自動補正

#### 動作確認完了

- ✅ 音声録音 → API送信
- ✅ OpenAI Whisper（音声→テキスト変換）
- ✅ OpenAI GPT（AI整理: 要約・分類・リマインド時刻）
- ✅ 通知スケジュール
- ✅ エンドツーエンドの一気通貫動作

#### MVPコアフロー完成

**録音 → AI整理 → "預かりました" → 通知1回** の全てが正常に動作！

実際のテスト結果例：
```
入力音声: "明日中にオクトパスに取り合わせをする"
↓
AI整理結果:
- transcript: "明日中にオクトパスに取り合わせをする"
- summary: "オクトパスに問い合わせ"
- category: "仕事"
- suggestedTime: "2026-01-12T00:00:00.000Z"
↓
通知設定成功
```

### 次回開始時の注意事項

1. **開発サーバーの起動**
   ```bash
   # ターミナル1: クライアント
   cd client && npx expo start

   # ターミナル2: バックエンド
   cd server && npm run dev
   ```

2. **環境変数の確認**
   - `server/.env` に OpenAI APIキーが設定されているか確認
   - API URLは開発環境用（172.20.10.2）に設定済み

3. **次のフェーズ: Phase 7（テスト・バグ修正）**
   - `DEVELOPMENT_PLAN.md` のPhase 7を参照
   - 様々な入力パターンでテスト
   - エッジケースの確認
   - パフォーマンステスト（3秒以内起動）

4. **重要な設計原則**
   - MVP範囲内で最小限の実装に留める
   - 3秒以内の起動時間を維持
   - シンプルなUIを心がける

### トラブルシューティング

#### Cursorエディタでファイルが更新されない場合
```bash
# Gitの最新コミットに復元
git restore <filename>
```

#### サーバーが起動しない場合
```bash
# ポート使用状況確認
lsof -i :3000
# プロセス停止
kill -9 <PID>
```

---

## 開発履歴

### 2026年1月11日
- **Phase 2完了**: 音声録音機能の実装
  - audioRecorder.tsサービス作成
  - 録音権限設定（iOS/Android）
  - App.tsxに録音機能統合
  - 動作確認完了（録音→ファイルURI取得）

- **Phase 4完了**: API連携（クライアント統合）
  - apiClient.tsサービス作成
  - 実際のAPI呼び出しに置き換え
  - サーバー側修正（0.0.0.0でリッスン）
  - OpenAI API連携成功（Whisper + GPT-4o）
  - 通知時刻バグ修正（未来時刻提案の強化）

- **MVPコアフロー完成**
  - 録音 → AI整理 → "預かりました" → 通知1回 の全てが動作
  - エンドツーエンドテスト成功

- **Gitコミット**
  - 1edbf40: Implement Phase 2 (Audio Recording)
  - 0e94062: Implement Phase 4 (API Integration)

### 2026年1月6日
- Phase 1完了: 環境構築、動作確認
- README.md作成
- Gitリポジトリ初期化・コミット
- iPhone実機でアプリ起動確認
- バックエンドヘルスチェック確認
