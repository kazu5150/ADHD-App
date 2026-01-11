const OpenAI = require('openai');

// OpenAIクライアント初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30秒タイムアウト
});

/**
 * 音声ファイルをテキストに変換（Whisper API）
 * @param {Buffer} audioBuffer - 音声ファイルのバッファ
 * @param {string} filename - ファイル名（拡張子必須）
 * @returns {Promise<string>} - 文字起こし結果
 */
async function transcribeAudio(audioBuffer, filename = 'audio.m4a') {
  try {
    // BufferをFileオブジェクトに変換（OpenAI SDKはFileを要求）
    const file = new File([audioBuffer], filename, {
      type: 'audio/m4a',
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'ja', // 日本語指定（精度向上）
    });

    return transcription.text;
  } catch (error) {
    console.error('Whisper API error:', error);
    throw new Error('音声の文字起こしに失敗しました');
  }
}

/**
 * テキストをAIで整理（GPT API）
 * @param {string} transcript - 文字起こしテキスト
 * @returns {Promise<Object>} - { summary, category, suggestedTime }
 */
async function organizeThought(transcript) {
  try {
    const currentTime = new Date();

    // 1時間後の時刻を計算
    const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);

    // システムプロンプト
    const systemPrompt = `あなたはユーザーの思考を整理するアシスタントです。
音声メモから以下の情報を抽出してください：

1. summary: 1行で要約（20文字以内が理想）
2. category: 以下の4つから1つ選択
   - "仕事" : 業務、タスク、締切に関すること
   - "生活" : 買い物、家事、予定に関すること
   - "アイデア" : 思いつき、企画、メモしたいこと
   - "不安・気がかり" : 心配事、漠然とした不安

3. suggestedTime: リマインド候補時刻（ISO 8601形式、日本時間 +09:00）
   - 現在時刻: ${currentTime.toISOString()}
   - **重要: 必ず現在時刻より未来の時刻を提案してください**
   - 最低でも1時間後（${oneHourLater.toISOString()}）以降の時刻を提案
   - 例:
     * 朝（6-11時）のメモ → 同日の夕方17-19時
     * 昼（12-17時）のメモ → 同日の夜20-22時
     * 夜（18時以降）のメモ → 翌朝9-10時

ユーザー入力が意味不明・空の場合:
- summary: "メモを受け取りました"
- category: "不安・気がかり"
- suggestedTime: 翌朝9時を提案

JSON形式で出力してください。`;

    const userPrompt = `以下の音声メモを整理してください：\n\n${transcript}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o（高速・高精度）
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' }, // JSON Mode
      temperature: 0.3, // 低温度で安定した出力
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // バリデーション
    const validCategories = ['仕事', '生活', 'アイデア', '不安・気がかり'];
    if (!validCategories.includes(result.category)) {
      result.category = '不安・気がかり'; // デフォルト
    }

    // suggestedTimeのバリデーション（ISO 8601形式チェック）
    if (!result.suggestedTime || !result.suggestedTime.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      // 無効な場合は翌朝9時をデフォルト
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      result.suggestedTime = tomorrow.toISOString();
    } else {
      // 過去の時刻チェック
      const suggestedDate = new Date(result.suggestedTime);
      if (suggestedDate <= currentTime) {
        console.warn('AIが過去の時刻を提案したため、翌朝9時に補正します');
        const tomorrow = new Date(currentTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        result.suggestedTime = tomorrow.toISOString();
      }
    }

    return {
      summary: result.summary || 'メモを受け取りました',
      category: result.category,
      suggestedTime: result.suggestedTime,
    };
  } catch (error) {
    console.error('GPT API error:', error);
    throw new Error('AIによる整理に失敗しました');
  }
}

/**
 * 音声ファイルを受け取り、整理済みデータを返す（メイン関数）
 * @param {Buffer} audioBuffer - 音声ファイルのバッファ
 * @param {string} filename - ファイル名
 * @returns {Promise<Object>} - { transcript, summary, category, suggestedTime }
 */
async function processVoice(audioBuffer, filename) {
  // 1. 音声→テキスト
  const transcript = await transcribeAudio(audioBuffer, filename);

  // 2. テキスト→整理
  const organized = await organizeThought(transcript);

  return {
    transcript,
    ...organized,
  };
}

module.exports = {
  transcribeAudio,
  organizeThought,
  processVoice,
};
