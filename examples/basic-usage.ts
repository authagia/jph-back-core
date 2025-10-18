/**
 * 基本的な使用例
 * 
 * このファイルは、OPRFサービスの基本的な使用方法を示します。
 */

import { OPRFService } from '../src/services/OPRFService';

async function basicExample() {
    console.log('🚀 基本的なOPRF使用例を開始します...');
    
    try {
        // 1. OPRFサービスを初期化
        const oprfService = new OPRFService('./secrets/key.priv');
        await oprfService.initialize();
        
        console.log('✅ OPRFサービスが初期化されました');
        
        // 2. 単一データの処理
        const input = new TextEncoder().encode("Hello, OPRF World!");
        console.log('📝 入力データ:', input);
        
        const result = await oprfService.processData(input);
        console.log('🔐 処理結果:', result);
        console.log('📊 結果サイズ:', result.length, 'bytes');
        
        // 3. バッチ処理の例
        const batchInputs = [
            new TextEncoder().encode("First message"),
            new TextEncoder().encode("Second message"),
            new TextEncoder().encode("Third message")
        ];
        
        console.log('📦 バッチ処理を開始します...');
        const batchResults = await oprfService.processBatch(batchInputs);
        
        console.log('✅ バッチ処理完了');
        console.log('📊 処理されたアイテム数:', batchResults.length);
        
        batchResults.forEach((result, index) => {
            console.log(`  アイテム ${index + 1}: ${result.length} bytes`);
        });
        
    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
    }
}

// 例を実行
basicExample();
