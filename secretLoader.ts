import { readFile } from 'fs/promises';
import * as path from 'path';

/**
 * ファイルシステムから秘密鍵を非同期でロードするクラス。
 */
export class SecretKeyLoader {
    private keyPath: string;
    private encoding: BufferEncoding = 'utf8';

    /**
     * SecretKeyLoaderの新しいインスタンスを作成します。
     * @param relativeOrAbsolutePath 秘密鍵ファイルへの相対パスまたは絶対パス。
     */
    constructor(relativeOrAbsolutePath: string) {
        // 絶対パスに解決する (例: プロジェクトのルートからの相対パスとして扱う)
        // 実際のアプリケーションでは、よりセキュアなパス解決ロジックを検討してください。
        this.keyPath = path.resolve(relativeOrAbsolutePath);
    }

    /**
     * ファイルから秘密鍵の内容を非同期で取得します。
     * @returns 秘密鍵の文字列を含むPromise。
     * @throws {Error} ファイルの読み込みに失敗した場合にスローされます。
     */
    public async getSecretKey(): Promise<Uint8Array> {
        try {
            // fs/promises の readFile を使用して非同期でファイルを読み込む
            const keyContent = await readFile(this.keyPath, { encoding: this.encoding });
            const b64String =  keyContent.trim(); // 前後の空白や改行を削除して返す
            return Buffer.from(b64String, 'base64');
        } catch (error) {
            console.error(`秘密鍵ファイルの読み込みに失敗しました: ${this.keyPath}`, error);
            // 呼び出し元でエラー処理できるように、エラーを再スローします
            // 実際には、特定のカスタムエラークラスを使用することも考慮してください。
            throw new Error(`秘密鍵の取得中にエラーが発生しました。パス: ${this.keyPath}`);
        }
    }
}

// -----------------------------------------------------------------------------

// 使用例 (Node.js環境での実行を想定)

// 例: 秘密鍵ファイルを './secrets/private.key' に配置している場合
// (このファイルは存在するものと仮定します)

/*
// 秘密鍵ファイル (例: ./secrets/private.key) の内容
// -----BEGIN PRIVATE KEY-----
// MIIEvQIBADANBgkqhkiG9w0BAQEFAASCB...
// -----END PRIVATE KEY-----
*/

/*
async function main() {
    const keyFilePath = './secrets/private.key';
    const loader = new SecretKeyLoader(keyFilePath);

    console.log(`秘密鍵ファイルをロード中: ${loader['keyPath']}`); // プライベートプロパティにアクセスする例

    try {
        const secretKey = await loader.getSecretKey();
        console.log("秘密鍵のロードに成功しました。");
        // 実際にはキー全体を表示せず、セキュリティに配慮して一部をマスク表示します
        console.log(`取得したキー（先頭20文字）：${secretKey.substring(0, 20)}...`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`アプリケーションの起動に失敗: ${error.message}`);
        } else {
            console.error('不明なエラー:', error);
        }
        // 秘密鍵のロード失敗は致命的な場合が多いので、プロセスを終了させることもあります
        // process.exit(1);
    }
}

// main();

*/