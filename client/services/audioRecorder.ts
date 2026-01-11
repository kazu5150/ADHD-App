import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';

let recording: Recording | null = null;

/**
 * 音声録音権限を取得
 * @returns {Promise<boolean>} 権限が許可されたかどうか
 */
export async function getPermissions(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();

    if (status !== 'granted') {
      console.log('音声録音権限が拒否されました');
      return false;
    }

    console.log('音声録音権限が許可されました');
    return true;
  } catch (error) {
    console.error('音声録音権限取得エラー:', error);
    return false;
  }
}

/**
 * 録音を開始
 * @returns {Promise<void>}
 */
export async function startRecording(): Promise<void> {
  try {
    // 既に録音中の場合は停止
    if (recording) {
      await stopRecording();
    }

    // 権限を確認
    const hasPermission = await getPermissions();
    if (!hasPermission) {
      throw new Error('音声録音権限がありません');
    }

    // オーディオモードを設定（録音モード）
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    console.log('録音を開始します...');

    // 録音開始
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
    console.log('録音中...');
  } catch (error) {
    console.error('録音開始エラー:', error);
    throw error;
  }
}

/**
 * 録音を停止し、ファイルURIを返す
 * @returns {Promise<string>} 録音ファイルのURI
 */
export async function stopRecording(): Promise<string> {
  try {
    if (!recording) {
      throw new Error('録音が開始されていません');
    }

    console.log('録音を停止します...');
    await recording.stopAndUnloadAsync();

    // オーディオモードをリセット
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    console.log('録音完了:', uri);

    // 録音オブジェクトをリセット
    recording = null;

    if (!uri) {
      throw new Error('録音ファイルのURIが取得できませんでした');
    }

    return uri;
  } catch (error) {
    console.error('録音停止エラー:', error);
    recording = null;
    throw error;
  }
}

/**
 * 現在の録音状態を取得
 * @returns {boolean} 録音中かどうか
 */
export function isRecording(): boolean {
  return recording !== null;
}

/**
 * 録音をキャンセル（ファイルを保存しない）
 */
export async function cancelRecording(): Promise<void> {
  try {
    if (recording) {
      console.log('録音をキャンセルします...');
      await recording.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      recording = null;
      console.log('録音がキャンセルされました');
    }
  } catch (error) {
    console.error('録音キャンセルエラー:', error);
    recording = null;
  }
}
