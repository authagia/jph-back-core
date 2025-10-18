import { ExpressService } from './src/services/ExpressService';

/**
 * メインアプリケーション
 * 
 * OPRFサーバーを起動し、Expressサービスを初期化します。
 */
async function main() {
    try {
        console.log('🚀 OPRF Server を起動しています...');
        
        // Expressサービスを初期化
        const expressService = new ExpressService();
        await expressService.initialize('./secrets/key.priv');
        
        // サーバーを開始
        const PORT = parseInt(process.env.PORT || '3000', 10);
        expressService.start(PORT);
        
    } catch (error) {
        console.error('❌ アプリケーションの起動に失敗しました:', error);
        process.exit(1);
    }
}

// アプリケーションを起動
main();