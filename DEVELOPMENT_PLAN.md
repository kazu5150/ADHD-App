# 開発計画書

**プロジェクト名**: 脳の一時置き場（仮）
**リリース目標**: 2026年1月末
**開発形式**: MVP（Minimum Viable Product）

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [開発フェーズ](#2-開発フェーズ)
3. [技術設計](#3-技術設計)
4. [API設計](#4-api設計)
5. [データモデル](#5-データモデル)
6. [UI/UXフロー](#6-uiuxフロー)
7. [ファイル構造](#7-ファイル構造)
8. [環境設定](#8-環境設定)
9. [テスト計画](#9-テスト計画)
10. [デプロイ計画](#10-デプロイ計画)
11. [リスクと対応策](#11-リスクと対応策)
12. [開発チェックリスト](#12-開発チェックリスト)

---

## 1. プロジェクト概要

### 1.1 目的
ADHD傾向のある人が、頭の中の思考を即座に退避させ、「今」に集中できる状態を作る

### 1.2 MVPの定義
「録音 → AI整理 → "預かりました" → 通知1回」のフローを完成させる

### 1.3 スコープ
#### 実装する機能
- ワンタップ音声録音
- OpenAI APIによる音声→テキスト変換
- AI整理（要約・4分類・リマインド時刻提案）
- 「預かりました」メッセージ表示
- 1件のみのプッシュ通知

#### 実装しない機能（MVP範囲外）
- タスク管理
- メモ一覧・検索
- データベース
- ユーザー登録・ログイン
- 複数デバイス同期

---

## 2. 開発フェーズ

### Phase 1: 環境構築（1日目）
**目標**: 開発環境を整え、基本構造を構築

- [ ] React Native + Expoプロジェクト作成
- [ ] Node.js + Expressバックエンド構築
- [ ] 必要なパッケージのインストール
- [ ] Gitリポジトリセットアップ
- [ ] 環境変数設定（.env）
- [ ] 基本的なフォルダ構造作成

**完了基準**:
- `npx expo start`でアプリが起動する
- `npm start`でバックエンドが起動する
- クライアントからバックエンドへのAPI通信が確認できる

---

### Phase 2: 音声録音機能（2-3日目）
**目標**: ワンタップで音声を録音し、ファイルとして保存

#### 2.1 実装タスク
- [ ] 音声録音権限の取得（iOS）
- [ ] 録音ボタンUI実装
- [ ] expo-avによる録音機能実装
- [ ] 録音ファイルの一時保存
- [ ] 録音状態の表示（録音中インジケーター）
- [ ] エラーハンドリング（権限拒否、録音失敗）

#### 2.2 技術仕様
```typescript
// services/audioRecorder.ts
- startRecording(): Promise<void>
- stopRecording(): Promise<string> // 録音ファイルのURIを返す
- getPermissions(): Promise<boolean>
```

**完了基準**:
- 録音ボタンをタップして音声を録音できる
- 録音終了後、ファイルURIが取得できる
- 権限エラーが適切に処理される

---

### Phase 3: バックエンドAPI実装（4-5日目）
**目標**: OpenAI APIと連携し、音声→テキスト→AI整理を実現

#### 3.1 実装タスク
- [ ] 音声ファイルアップロードエンドポイント
- [ ] OpenAI Whisper APIによる文字起こし
- [ ] OpenAI GPT APIによるAI整理
- [ ] エラーハンドリング（API失敗、タイムアウト）
- [ ] CORS設定
- [ ] 環境変数管理（APIキー）

#### 3.2 APIエンドポイント
```
POST /api/process-voice
Request: multipart/form-data (音声ファイル)
Response: {
  transcript: string,      // 文字起こし結果
  summary: string,         // 1行要約
  category: string,        // 分類（仕事/生活/アイデア/不安）
  suggestedTime: string    // リマインド候補時刻（ISO 8601形式）
}
```

#### 3.3 AI整理のプロンプト設計
```
システムプロンプト:
あなたはユーザーの思考を整理するアシスタントです。
以下の音声から、要約・分類・リマインド時刻を提案してください。

ユーザー入力: {transcript}

出力形式（JSON）:
{
  "summary": "1行で要約",
  "category": "仕事|生活|アイデア|不安・気がかり",
  "suggestedTime": "YYYY-MM-DDTHH:mm:ss+09:00"
}
```

**完了基準**:
- 音声ファイルをアップロードすると、JSON形式でレスポンスが返る
- OpenAI APIキーが環境変数から読み込まれる
- エラー時に適切なステータスコードとメッセージが返る

---

### Phase 4: クライアント統合（6-7日目）
**目標**: 録音からAI整理までの一連のフローを実装

#### 4.1 実装タスク
- [ ] 録音終了後、バックエンドへファイル送信
- [ ] ローディング表示（AI処理中）
- [ ] API通信エラーハンドリング
- [ ] レスポンスデータの表示
- [ ] AsyncStorageへの保存（任意）

#### 4.2 画面遷移
```
録音画面
  ↓ 録音ボタンタップ
録音中画面（インジケーター）
  ↓ 停止ボタンタップ
処理中画面（ローディング）
  ↓ API完了
結果表示画面（「預かりました」）
```

**完了基準**:
- 録音→API送信→結果表示まで一気通貫で動作する
- ローディング中はユーザーに進捗が見える
- エラー時に再試行または戻る選択肢がある

---

### Phase 5: UI実装（8-9日目）
**目標**: シンプルで静かなUIを実装

#### 5.1 実装タスク
- [ ] 色設計（白/淡色ベース）
- [ ] 録音ボタンのデザイン
- [ ] 「預かりました」メッセージ画面
- [ ] リマインド設定画面（はい/いいえ選択）
- [ ] アニメーション（控えめ）
- [ ] フォント・余白調整

#### 5.2 デザインガイドライン
```typescript
// constants/colors.ts
const colors = {
  background: '#FFFFFF',
  primary: '#F5F5F5',
  text: '#333333',
  textLight: '#999999',
  accent: '#E8F4F8',
};
```

**完了基準**:
- 白/淡色ベースのシンプルなUI
- 情報量が最小限
- アニメーションが静かで短い

---

### Phase 6: 通知機能（10-11日目）
**目標**: リマインド時刻に1件だけ通知を送る

#### 6.1 実装タスク
- [ ] 通知権限の取得
- [ ] expo-notificationsのセットアップ
- [ ] ローカル通知のスケジューリング
- [ ] 通知タップ時の動作
- [ ] 既存通知のキャンセル（1件のみ保証）

#### 6.2 技術仕様
```typescript
// services/notificationService.ts
- scheduleNotification(date: Date, message: string): Promise<string>
- cancelAllNotifications(): Promise<void>
- getPermissions(): Promise<boolean>
```

**完了基準**:
- 指定時刻に通知が届く
- 通知は常に1件のみ
- 通知をタップしてアプリが開く

---

### Phase 7: テスト・バグ修正（12-14日目）
**目標**: 実機で動作確認し、バグを修正

#### 7.1 テスト項目
- [ ] 音声録音テスト（短い/長い/ノイズ）
- [ ] AI処理テスト（様々な入力）
- [ ] 通知テスト（時刻指定、複数回）
- [ ] エラーハンドリングテスト
- [ ] パフォーマンステスト（3秒以内起動）
- [ ] メモリリークチェック

#### 7.2 実機テスト
- iPhone実機でのテスト
- バックグラウンド動作確認
- 通知の動作確認

**完了基準**:
- 致命的なバグが存在しない
- 3秒以内にアプリが起動する
- 通知が正しく動作する

---

### Phase 8: ビルド・配布準備（15-17日目）
**目標**: TestFlightでテスト配布可能な状態にする

#### 8.1 実装タスク
- [ ] アプリアイコン作成
- [ ] スプラッシュスクリーン作成
- [ ] app.json設定（バンドルID、バージョン）
- [ ] EASビルド設定
- [ ] Apple Developer登録
- [ ] TestFlightビルド

#### 8.2 必要な設定
```json
// app.json
{
  "expo": {
    "name": "脳の一時置き場",
    "slug": "brain-parking",
    "version": "0.1.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.brainparking",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "音声メモを録音するために必要です"
      }
    }
  }
}
```

**完了基準**:
- EAS Buildが成功する
- TestFlightでアプリがインストールできる
- 実機で全機能が動作する

---

### Phase 9: リリース準備（18-20日目）
**目標**: App Storeリリース準備を完了

#### 9.1 準備項目
- [ ] App Store Connectでアプリ登録
- [ ] スクリーンショット作成（各サイズ）
- [ ] アプリ説明文作成
- [ ] プライバシーポリシー作成
- [ ] 審査情報入力
- [ ] 本番ビルドアップロード

**完了基準**:
- App Storeに審査申請できる状態
- プライバシーポリシーが公開されている

---

## 3. 技術設計

### 3.1 アーキテクチャ図

```
┌─────────────────┐
│   iOS Device    │
│  React Native   │
│     + Expo      │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Backend API   │
│  Node.js/Express│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   OpenAI API    │
│  Whisper + GPT  │
└─────────────────┘
```

### 3.2 データフロー

```
1. ユーザーが録音ボタンをタップ
   ↓
2. expo-avで音声録音 → ローカルファイル保存
   ↓
3. バックエンドへmultipart/form-dataでアップロード
   ↓
4. Whisper APIで音声→テキスト変換
   ↓
5. GPT APIでテキスト→整理（要約・分類・時刻提案）
   ↓
6. JSONレスポンスをクライアントに返却
   ↓
7. 「預かりました」画面を表示
   ↓
8. ユーザーが「はい/いいえ」選択
   ↓
9. expo-notificationsでローカル通知をスケジュール
```

### 3.3 エラーハンドリング

| エラー種別 | 対応 |
|----------|------|
| 録音権限拒否 | 設定画面への誘導 |
| ネットワークエラー | リトライボタン表示 |
| OpenAI API失敗 | エラーメッセージ + リトライ |
| タイムアウト | 30秒でタイムアウト、リトライ |

---

## 4. API設計

### 4.1 エンドポイント一覧

#### POST /api/process-voice

**説明**: 音声ファイルを受け取り、AI整理した結果を返す

**リクエスト**:
```
Content-Type: multipart/form-data

audioFile: File (音声ファイル、m4a/wav/mp3)
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "transcript": "今日の夕方までに企画書を完成させないと",
    "summary": "企画書の締切が今日の夕方",
    "category": "仕事",
    "suggestedTime": "2026-01-06T17:00:00+09:00"
  }
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "message": "音声ファイルの処理に失敗しました",
    "code": "PROCESSING_ERROR"
  }
}
```

**ステータスコード**:
- 200: 成功
- 400: 不正なリクエスト
- 500: サーバーエラー
- 503: OpenAI API利用不可

---

### 4.2 セキュリティ

#### 4.2.1 APIキー管理
```bash
# server/.env
OPENAI_API_KEY=sk-...
PORT=3000
NODE_ENV=production
```

#### 4.2.2 CORS設定
```javascript
// server/index.js
const cors = require('cors');
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-app.com'
    : '*'
}));
```

#### 4.2.3 レート制限（今後の実装）
- 1ユーザーあたり1日3回まで（無料版）
- IP単位でのレート制限

---

## 5. データモデル

### 5.1 クライアント側データ（AsyncStorage）

```typescript
// types/memo.ts
interface Memo {
  id: string;              // UUID
  transcript: string;      // 文字起こし結果
  summary: string;         // 要約
  category: MemoCategory;  // 分類
  suggestedTime: string;   // ISO 8601形式
  createdAt: string;       // ISO 8601形式
  notificationId?: string; // 通知ID（キャンセル用）
}

type MemoCategory = '仕事' | '生活' | 'アイデア' | '不安・気がかり';

// 保存形式
// Key: 'memos'
// Value: JSON.stringify(Memo[])
```

### 5.2 ストレージ設計

**保存対象**: 直近3件のみ（MVP）

**理由**:
- MVPでは「見返さない」設計
- メモリ節約
- プライバシー保護

```typescript
// services/storageService.ts
const MAX_MEMOS = 3;

async function saveMemo(memo: Memo): Promise<void> {
  const memos = await getMemos();
  memos.unshift(memo); // 新しいものを先頭に
  const limitedMemos = memos.slice(0, MAX_MEMOS); // 3件まで
  await AsyncStorage.setItem('memos', JSON.stringify(limitedMemos));
}
```

---

## 6. UI/UXフロー

### 6.1 画面構成

```
┌─────────────────────────┐
│    ホーム画面            │
│  ┌───────────────┐      │
│  │  録音ボタン     │      │
│  │   (大きい)     │      │
│  └───────────────┘      │
│                         │
│  今日はもう大丈夫         │
└─────────────────────────┘
         ↓ タップ
┌─────────────────────────┐
│    録音中画面            │
│                         │
│    ● REC               │
│   録音中...             │
│                         │
│  ┌───────────────┐      │
│  │  停止ボタン    │      │
│  └───────────────┘      │
└─────────────────────────┘
         ↓ 停止
┌─────────────────────────┐
│   AI処理中画面           │
│                         │
│   ⏳ 整理中です...       │
│                         │
│  （プログレスバー）       │
└─────────────────────────┘
         ↓ 完了
┌─────────────────────────┐
│   完了画面               │
│                         │
│   ✓ 預かりました         │
│                         │
│   「企画書の締切が         │
│    今日の夕方」          │
│                         │
│   思い出しますか？        │
│   今日 17:00            │
│                         │
│  [はい]    [いいえ]     │
└─────────────────────────┘
```

### 6.2 タップ数の最小化

| 操作 | タップ数 |
|------|---------|
| 録音開始 | 1タップ |
| 録音停止 | 1タップ |
| 通知設定 | 1タップ（はい/いいえ） |
| **合計** | **最大3タップ** ✅ |

### 6.3 色設計

```typescript
const theme = {
  background: '#FFFFFF',      // 背景（白）
  card: '#F9F9F9',           // カード背景（薄グレー）
  text: '#333333',           // 本文（濃グレー）
  textLight: '#999999',      // 補助テキスト（グレー）
  accent: '#E8F4F8',         // アクセント（薄青）
  success: '#E8F8E8',        // 成功（薄緑）
  record: '#FF6B6B',         // 録音ボタン（赤）
};
```

---

## 7. ファイル構造

```
ADHD-App/
├── client/                     # React Native アプリ
│   ├── App.tsx                # エントリーポイント
│   ├── app.json               # Expo設定
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── screens/               # 画面コンポーネント
│   │   ├── HomeScreen.tsx     # ホーム（録音ボタン）
│   │   ├── RecordingScreen.tsx # 録音中
│   │   ├── ProcessingScreen.tsx # AI処理中
│   │   └── CompleteScreen.tsx  # 完了（預かりました）
│   │
│   ├── components/            # 再利用可能コンポーネント
│   │   ├── RecordButton.tsx   # 録音ボタン
│   │   ├── LoadingIndicator.tsx # ローディング
│   │   └── MessageCard.tsx    # メッセージカード
│   │
│   ├── services/              # ビジネスロジック
│   │   ├── audioRecorder.ts   # 音声録音
│   │   ├── apiClient.ts       # API通信
│   │   ├── notificationService.ts # 通知
│   │   └── storageService.ts  # ローカルストレージ
│   │
│   ├── types/                 # TypeScript型定義
│   │   ├── memo.ts           # Memo型
│   │   └── api.ts            # API型
│   │
│   └── constants/             # 定数
│       ├── colors.ts         # 色定義
│       └── config.ts         # 設定
│
├── server/                    # Node.js バックエンド
│   ├── index.js              # Express サーバー
│   ├── package.json
│   ├── .env                  # 環境変数（Git管理外）
│   ├── .env.example          # 環境変数のテンプレート
│   │
│   ├── routes/               # APIルート
│   │   └── processVoice.js   # POST /api/process-voice
│   │
│   ├── services/             # ビジネスロジック
│   │   ├── openaiService.js  # OpenAI連携
│   │   └── fileService.js    # ファイル処理
│   │
│   └── middleware/           # ミドルウェア
│       ├── errorHandler.js   # エラーハンドリング
│       └── upload.js         # multer設定
│
├── CLAUDE.md                 # Claude Code用ドキュメント
├── DEVELOPMENT_PLAN.md       # 本ファイル
├── requirements.md           # 要件定義
└── README.md                 # プロジェクト概要
```

---

## 8. 環境設定

### 8.1 必要なツール

| ツール | バージョン | 用途 |
|--------|----------|------|
| Node.js | 18.x以上 | バックエンド・フロントエンド |
| npm | 9.x以上 | パッケージ管理 |
| Expo CLI | 最新 | React Native開発 |
| Xcode | 15.x以上 | iOSビルド（Macのみ） |

### 8.2 クライアント環境設定

```bash
# Expo CLI インストール
npm install -g expo-cli eas-cli

# プロジェクト作成
npx create-expo-app client --template blank-typescript

# 依存関係インストール
cd client
npx expo install expo-av expo-notifications @react-native-async-storage/async-storage
```

### 8.3 バックエンド環境設定

```bash
# プロジェクト作成
mkdir server && cd server
npm init -y

# 依存関係インストール
npm install express cors multer openai dotenv
npm install --save-dev nodemon

# .env.example作成
cat > .env.example << EOF
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
EOF
```

### 8.4 環境変数

#### クライアント（app.json）
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000"
    }
  }
}
```

#### バックエンド（.env）
```bash
OPENAI_API_KEY=sk-proj-...
PORT=3000
NODE_ENV=development
```

---

## 9. テスト計画

### 9.1 単体テスト（Optional for MVP）

MVPでは実装しないが、将来的に以下をテスト：

```typescript
// __tests__/audioRecorder.test.ts
describe('AudioRecorder', () => {
  it('録音開始時に権限を確認する', async () => {});
  it('録音停止時にファイルURIを返す', async () => {});
});
```

### 9.2 統合テスト（手動テスト）

| テストケース | 期待結果 |
|------------|---------|
| 録音→AI整理→完了 | 一連のフローが正常に完了する |
| 権限拒否 | 設定画面への誘導メッセージが表示される |
| ネットワークエラー | リトライボタンが表示される |
| 長時間録音 | 2分以上の録音が可能 |
| 短時間録音 | 3秒未満の録音でもエラーにならない |
| 通知設定 | 指定時刻に通知が届く |
| 通知タップ | アプリが開く |

### 9.3 パフォーマンステスト

| 項目 | 目標値 | 測定方法 |
|------|-------|---------|
| アプリ起動時間 | 3秒以内 | 実機計測 |
| 録音開始までの時間 | 1秒以内 | 実機計測 |
| API応答時間 | 10秒以内 | ネットワークモニター |

---

## 10. デプロイ計画

### 10.1 バックエンドデプロイ

#### オプション1: Render（推奨）
```bash
# Renderにデプロイ
1. render.comにアカウント作成
2. 新しいWeb Serviceを作成
3. GitHubリポジトリを連携
4. Build Command: npm install
5. Start Command: npm start
6. 環境変数にOPENAI_API_KEYを設定
```

#### オプション2: Fly.io
```bash
# Fly.ioにデプロイ
flyctl launch
flyctl secrets set OPENAI_API_KEY=sk-...
flyctl deploy
```

### 10.2 クライアントデプロイ

#### TestFlight配布
```bash
# EAS Buildセットアップ
cd client
eas build:configure

# iOSビルド
eas build --platform ios --profile production

# TestFlightに自動アップロード
```

#### App Store審査
1. App Store Connectでアプリ情報入力
2. スクリーンショット・説明文を追加
3. プライバシーポリシーURLを設定
4. 審査申請

---

## 11. リスクと対応策

### 11.1 技術的リスク

| リスク | 影響度 | 発生確率 | 対応策 |
|--------|--------|---------|--------|
| OpenAI API障害 | 高 | 低 | エラーメッセージ表示、リトライ機能 |
| 音声認識精度低下 | 中 | 中 | ユーザーに再録音を促す |
| 3秒以内起動が困難 | 高 | 中 | 起動時の処理を最小化、遅延ロード |
| TestFlightビルド失敗 | 高 | 低 | ビルドログ確認、Expo公式サポート利用 |
| App Store審査却下 | 高 | 中 | 審査ガイドライン熟読、不足情報を事前準備 |

### 11.2 スケジュールリスク

| リスク | 対応策 |
|--------|--------|
| OpenAI API連携に時間がかかる | Phase 3を優先、早めに着手 |
| UI実装に時間がかかる | デザインを最小限に、標準コンポーネントのみ使用 |
| TestFlightビルドに時間がかかる | Phase 8を余裕を持って開始 |

### 11.3 スコープ調整

期限に間に合わない場合、以下の優先順位で機能を削減：

**必須（絶対削除不可）**:
1. 音声録音
2. AI整理（要約・分類）
3. 「預かりました」メッセージ

**削除可能**:
1. リマインド通知（最悪削除可能）
2. AsyncStorageへの保存（削除可能）
3. アニメーション（削除可能）

---

## 12. 開発チェックリスト

### Phase 1: 環境構築
- [x] Node.js, npm, Expoのインストール確認
- [x] React Nativeプロジェクト作成
- [x] Node.jsバックエンドプロジェクト作成
- [ ] Gitリポジトリ初期化
- [x] .gitignore設定（node_modules, .env）
- [x] 基本フォルダ構造作成

### Phase 2: 音声録音
- [ ] expo-avインストール
- [ ] 録音権限取得実装
- [ ] 録音開始/停止機能実装
- [ ] 録音ファイル保存確認
- [ ] エラーハンドリング実装

### Phase 3: バックエンド
- [ ] Express サーバー起動確認
- [ ] CORS設定
- [ ] multer設定（ファイルアップロード）
- [ ] OpenAI APIキー設定
- [ ] Whisper API連携
- [ ] GPT API連携（要約・分類）
- [ ] エラーハンドリング

### Phase 4: クライアント統合
- [ ] API通信実装
- [ ] ローディング表示
- [ ] エラーハンドリング
- [ ] レスポンス表示
- [ ] 一連のフロー動作確認

### Phase 5: UI実装
- [ ] 色設計実装
- [ ] 録音ボタンデザイン
- [ ] 「預かりました」画面
- [ ] リマインド設定画面
- [ ] アニメーション実装

### Phase 6: 通知機能
- [ ] expo-notificationsインストール
- [ ] 通知権限取得
- [ ] ローカル通知スケジュール実装
- [ ] 通知キャンセル実装
- [ ] 通知動作確認

### Phase 7: テスト
- [ ] 音声録音テスト
- [ ] AI処理テスト
- [ ] 通知テスト
- [ ] エラーハンドリングテスト
- [ ] パフォーマンステスト

### Phase 8: ビルド準備
- [ ] アプリアイコン作成
- [ ] スプラッシュスクリーン作成
- [ ] app.json設定
- [ ] EASビルド設定
- [ ] TestFlightビルド

### Phase 9: リリース準備
- [ ] App Store Connectアプリ登録
- [ ] スクリーンショット作成
- [ ] アプリ説明文作成
- [ ] プライバシーポリシー作成
- [ ] 審査情報入力
- [ ] 本番ビルドアップロード

---

## 13. 付録

### 13.1 参考リンク

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Developer](https://developer.apple.com/)

### 13.2 使用ライブラリライセンス

| ライブラリ | ライセンス |
|-----------|-----------|
| React Native | MIT |
| Expo | MIT |
| Express | MIT |
| OpenAI | Proprietary |

---

## 14. 最終確認事項

リリース前に以下を必ず確認：

### 機能確認
- [ ] 3秒で吐き出せる
- [ ] 使ったあと情報が残らない（表示されない）
- [ ] 不安を増やす要素がない
- [ ] 自分が毎日使いたいか？

### セキュリティ確認
- [ ] OpenAI APIキーがクライアントに含まれていない
- [ ] .envがGit管理されていない
- [ ] ユーザーデータが暗号化されている（将来実装）

### パフォーマンス確認
- [ ] アプリ起動〜録音開始まで3秒以内
- [ ] 操作ステップは最大2タップ

### UX確認
- [ ] 「もう頭で持たなくていい」と感じられる
- [ ] 「今はこれだけでいい」と感じられる
- [ ] 「今日は大丈夫」と感じられる

---

**この計画書は開発の進捗に応じて更新してください。**
