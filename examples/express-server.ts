/**
 * Expressサーバーの使用例
 * 
 * このファイルは、Expressサービスを使用してサーバーを起動する方法を示します。
 */

import { ExpressService } from '../src/services/ExpressService';

async function startExpressServer() {
    console.log('🚀 Expressサーバーの使用例を開始します...');
    
    try {
        // 1. Expressサービスを初期化
        const expressService = new ExpressService();
        await expressService.initialize('./secrets/key.priv');
        
        console.log('✅ Expressサービスが初期化されました');
        
        // 2. サーバーを起動
        const port = 3000;
        expressService.start(port, () => {
            console.log(`🎉 サーバーがポート ${port} で起動しました！`);
            console.log(`📊 ステータス: http://localhost:${port}/api/status`);
            console.log(`🔐 OPRF処理: http://localhost:${port}/upload-binary`);
            console.log(`📦 バッチ処理: http://localhost:${port}/api/oprf/batch`);
        });
        
    } catch (error) {
        console.error('❌ サーバーの起動に失敗しました:', error);
        process.exit(1);
    }
}

// サーバーを起動
startExpressServer();
