# 使用例

このディレクトリには、OPRFサーバーの様々な使用例が含まれています。

## 📁 ファイル一覧

### `basic-usage.ts`
OPRFサービスの基本的な使用方法を示します。

**実行方法:**
```bash
bun run examples/basic-usage.ts
```

**内容:**
- OPRFサービスの初期化
- 単一データの処理
- バッチ処理の実行

### `express-server.ts`
Expressサーバーを起動する方法を示します。

**実行方法:**
```bash
bun run examples/express-server.ts
```

**内容:**
- Expressサービスの初期化
- サーバーの起動
- エンドポイントの確認

### `client-example.ts`
OPRFサーバーにリクエストを送信するクライアントの例を示します。

**実行方法:**
```bash
# まずサーバーを起動
bun run examples/express-server.ts

# 別のターミナルでクライアントを実行
bun run examples/client-example.ts
```

**内容:**
- サーバーステータスの確認
- バイナリデータの送信
- バッチデータの送信

## 🚀 クイックスタート

1. **サーバーを起動:**
   ```bash
   bun run examples/express-server.ts
   ```

2. **クライアントを実行:**
   ```bash
   bun run examples/client-example.ts
   ```

3. **基本的な使用例を実行:**
   ```bash
   bun run examples/basic-usage.ts
   ```

## 📝 注意事項

- 例を実行する前に、`secrets/key.priv`ファイルが存在することを確認してください
- クライアント例を実行する前に、サーバーが起動していることを確認してください
- ポート3000が使用可能であることを確認してください

## 🔧 カスタマイズ

これらの例を参考に、独自のアプリケーションを作成できます：

1. **OPRFサービスの直接使用**: `basic-usage.ts`を参考
2. **Webサーバーの構築**: `express-server.ts`を参考
3. **クライアントアプリケーション**: `client-example.ts`を参考

## 🆘 トラブルシューティング

### よくある問題

1. **秘密鍵ファイルが見つからない**
   ```
   エラー: 秘密鍵ファイルの読み込みに失敗しました
   ```
   → `secrets/key.priv`ファイルが存在することを確認

2. **ポートが既に使用されている**
   ```
   エラー: EADDRINUSE: address already in use :::3000
   ```
   → 別のポートを使用するか、既存のプロセスを終了

3. **サーバーに接続できない**
   ```
   エラー: fetch failed
   ```
   → サーバーが起動していることを確認
