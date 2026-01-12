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
 * リマインド時刻を計算
 * @returns {string} - ISO 8601形式の時刻
 */
function calculateReminderTime() {
  const now = new Date();
  const hour = now.getHours();
  let suggestedTime = new Date(now);

  if (hour < 12) {
    // 朝 → 夕方17時
    suggestedTime.setHours(17, 0, 0, 0);
  } else if (hour < 18) {
    // 昼 → 夜20時
    suggestedTime.setHours(20, 0, 0, 0);
  } else {
    // 夜 → 翌朝9時
    suggestedTime.setDate(suggestedTime.getDate() + 1);
    suggestedTime.setHours(9, 0, 0, 0);
  }

  return suggestedTime.toISOString();
}

/**
 * テキストをAIで整理（GPT API）
 * @param {string} transcript - 文字起こしテキスト
 * @returns {Promise<Object>} - { organizedContent, hasReminder, suggestedTime? }
 */
async function organizeThought(transcript) {
  try {
    // システムプロンプト
    const systemPrompt = `あなたは思考整理のアシスタントです。入力は音声の文字起こしで、支離滅裂でも構いません。

次のルールを厳守してください：
- 正解を出そうとしない
- 必ず「これは仮の整理です。」から始める
- 4分類（🧠😟📌🗑）で整理し、順序を固定する
- タスク（📌）は最大3つまで
- タスクは必ず「5分以内で終わる具体行動」にする
- 感情や不安はタスク化しない
- 重い作業や曖昧な作業はタスク化しない（例：『人生を変える』『完璧に準備する』など）
- 3つを超えそうなら、最も小さくて今すぐできる上位3つに絞り、残りは🧠へ戻す

出力は必ず以下のMarkdownフォーマットのみ。余計な説明は禁止。

これは仮の整理です。

🧠 考え事：
・[項目がある場合のみ記載]

😟 感情・不安：
・[項目がある場合のみ記載]

📌 やること候補（最大3つ）：
・[項目がある場合のみ記載]

🗑 今は捨ててOK：
・[項目がある場合のみ記載]
`;

    const userPrompt = `以下の音声メモを整理してください：\n\n${transcript}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1, // 低温度で安定化
    });

    const organizedContent = completion.choices[0].message.content;

    // 📌セクションの抽出
    const taskSection = organizedContent.match(/📌 やること候補.*?\n([\s\S]*?)(?=\n(?:🧠|😟|🗑)|$)/);
    const hasReminder = taskSection && taskSection[1].trim().length > 0;

    // リマインド時刻計算（📌ありの場合のみ）
    if (hasReminder) {
      const suggestedTime = calculateReminderTime();
      return { organizedContent, hasReminder, suggestedTime };
    } else {
      return { organizedContent, hasReminder: false };
    }
  } catch (error) {
    console.error('GPT API error:', error);
    throw new Error('AIによる整理に失敗しました');
  }
}

/**
 * 音声ファイルを受け取り、整理済みデータを返す（メイン関数）
 * @param {Buffer} audioBuffer - 音声ファイルのバッファ
 * @param {string} filename - ファイル名
 * @returns {Promise<Object>} - { transcript, organizedContent, hasReminder, suggestedTime? }
 */
async function processVoice(audioBuffer, filename) {
  // 1. 音声→テキスト
  const transcript = await transcribeAudio(audioBuffer, filename);

  // 2. テキスト→整理
  const organized = await organizeThought(transcript);

  return {
    transcript,
    organizedContent: organized.organizedContent,
    hasReminder: organized.hasReminder,
    suggestedTime: organized.suggestedTime, // 📌の場合のみ存在
  };
}

module.exports = {
  transcribeAudio,
  organizeThought,
  processVoice,
};
