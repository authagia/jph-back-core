/**
 * クライアント側の使用例
 * 
 * このファイルは、OPRFサーバーにリクエストを送信するクライアントの例を示します。
 */

/**
 * OPRFサーバーにバイナリデータを送信する例
 */
async function sendBinaryData() {
    const serverUrl = 'http://localhost:3000';
    const data = new TextEncoder().encode("Hello from client!");
    
    try {
        console.log('📤 バイナリデータを送信中...');
        
        const response = await fetch(`${serverUrl}/upload-binary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: data
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.arrayBuffer();
        console.log('✅ 処理完了');
        console.log('📊 結果サイズ:', result.byteLength, 'bytes');
        
        return new Uint8Array(result);
        
    } catch (error) {
        console.error('❌ リクエストに失敗しました:', error);
        throw error;
    }
}

/**
 * OPRFサーバーにバッチデータを送信する例
 */
async function sendBatchData() {
    const serverUrl = 'http://localhost:3000';
    const data = ["First message", "Second message", "Third message"];
    
    try {
        console.log('📤 バッチデータを送信中...');
        
        const response = await fetch(`${serverUrl}/api/oprf/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ バッチ処理完了');
        console.log('📊 処理されたアイテム数:', result.count);
        console.log('🔐 結果:', result.results);
        
        return result;
        
    } catch (error) {
        console.error('❌ バッチリクエストに失敗しました:', error);
        throw error;
    }
}

/**
 * サーバーのステータスを確認する例
 */
async function checkServerStatus() {
    const serverUrl = 'http://localhost:3000';
    
    try {
        console.log('📊 サーバーステータスを確認中...');
        
        const response = await fetch(`${serverUrl}/api/status`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const status = await response.json();
        console.log('✅ サーバーステータス:', status);
        
        return status;
        
    } catch (error) {
        console.error('❌ ステータス確認に失敗しました:', error);
        throw error;
    }
}

/**
 * メイン関数
 */
async function main() {
    console.log('🚀 クライアント例を開始します...');
    
    try {
        // 1. サーバーステータスを確認
        await checkServerStatus();
        
        // 2. バイナリデータを送信
        await sendBinaryData();
        
        // 3. バッチデータを送信
        await sendBatchData();
        
        console.log('🎉 すべての例が完了しました！');
        
    } catch (error) {
        console.error('❌ 例の実行に失敗しました:', error);
    }
}

// 例を実行
main();
