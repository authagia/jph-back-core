# API リファレンス

このドキュメントは、OPRF ServerのAPIエンドポイントの詳細な仕様を提供します。

## 📋 概要

- **Base URL**: `http://localhost:3000`
- **API Version**: 1.0.0
- **Content-Type**: `application/json` (JSONエンドポイント)
- **Content-Type**: `application/octet-stream` (バイナリエンドポイント)

## 🔗 エンドポイント一覧

### ヘルスチェック

#### GET /

サーバーの基本情報を取得します。

**リクエスト:**
```http
GET / HTTP/1.1
Host: localhost:3000
```

**レスポンス:**
```json
{
    "message": "OPRF Server is running! 🚀",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
}
```

**ステータスコード:**
- `200 OK`: 正常に取得

---

### システムステータス

#### GET /api/status

サーバーとOPRFサービスの詳細なステータス情報を取得します。

**リクエスト:**
```http
GET /api/status HTTP/1.1
Host: localhost:3000
```

**レスポンス:**
```json
{
    "status": "OK",
    "runtime": "Bun",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "oprf": {
        "initialized": true
    }
}
```

**レスポンスフィールド:**
- `status` (string): サーバーの状態 ("OK")
- `runtime` (string): ランタイム環境 ("Bun")
- `timestamp` (string): レスポンス時刻 (ISO 8601形式)
- `oprf.initialized` (boolean): OPRFサービスの初期化状態

**ステータスコード:**
- `200 OK`: 正常に取得

---

### OPRF処理

#### POST /upload-binary

バイナリデータに対してOPRF（Oblivious Pseudorandom Function）処理を実行します。

**リクエスト:**
```http
POST /upload-binary HTTP/1.1
Host: localhost:3000
Content-Type: application/octet-stream
Content-Length: <data-length>

<binary-data>
```

**リクエストボディ:**
- **Content-Type**: `application/octet-stream`
- **Body**: 処理するバイナリデータ

**レスポンス:**
```http
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Length: <result-length>

<processed-binary-data>
```

**レスポンスフィールド:**
- **Content-Type**: `application/octet-stream`
- **Body**: 処理済みバイナリデータ

**ステータスコード:**
- `200 OK`: 処理が正常に完了
- `400 Bad Request`: リクエストデータが無効
- `500 Internal Server Error`: サーバー内部エラー

**エラーレスポンス (400):**
```json
{
    "error": "Binary data is missing or empty.",
    "code": "MISSING_DATA"
}
```

**エラーレスポンス (500):**
```json
{
    "error": "Internal server error during OPRF processing.",
    "code": "OPRF_ERROR"
}
```

---

## 🔍 API ドキュメント

### Swagger UI

インタラクティブなAPIドキュメントとテスト機能:
- **URL**: http://localhost:3000/api-docs/
- **機能**: 
  - エンドポイントの詳細表示
  - リクエスト/レスポンスの例
  - 実際のAPIテスト実行

### OpenAPI仕様書

機械可読なAPI仕様書:
- **URL**: http://localhost:3000/api-docs.json
- **形式**: OpenAPI 3.0 JSON
- **用途**: コード生成、APIクライアント作成

## ⚠️ エラーハンドリング

### エラーレスポンス形式

すべてのエラーは統一された形式で返されます：

```json
{
    "error": "エラーメッセージ",
    "code": "ERROR_CODE",
    "path": "/api/endpoint",
    "method": "GET"
}
```

### エラーコード一覧

| コード | 説明 | HTTPステータス |
|--------|------|----------------|
| `MISSING_DATA` | リクエストデータが不足 | 400 |
| `INVALID_DATA` | データ形式が無効 | 400 |
| `OPRF_ERROR` | OPRF処理エラー | 500 |
| `BATCH_OPRF_ERROR` | バッチ処理エラー | 500 |

### 404エラー

存在しないエンドポイントへのアクセス:

```json
{
    "error": "Endpoint not found",
    "path": "/api/nonexistent",
    "method": "GET"
}
```

## 🔒 セキュリティ

### 認証

現在のバージョンでは認証機能は実装されていません。本番環境での使用時は適切な認証機構の実装を推奨します。

### CORS

開発環境では全オリジンからのアクセスを許可しています：

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
```

### レート制限

現在のバージョンではレート制限は実装されていません。本番環境での使用時は適切なレート制限の実装を推奨します。

## 📊 使用例

### cURLでの使用例

#### ヘルスチェック
```bash
curl -X GET http://localhost:3000/
```

#### ステータス確認
```bash
curl -X GET http://localhost:3000/api/status
```

#### OPRF処理
```bash
# バイナリファイルの処理
curl -X POST \
  -H "Content-Type: application/octet-stream" \
  --data-binary @input.bin \
  http://localhost:3000/upload-binary \
  --output result.bin
```

### JavaScriptでの使用例

```javascript
// ヘルスチェック
const healthResponse = await fetch('http://localhost:3000/');
const healthData = await healthResponse.json();
console.log(healthData);

// ステータス確認
const statusResponse = await fetch('http://localhost:3000/api/status');
const statusData = await statusResponse.json();
console.log(statusData);

// OPRF処理
const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
const oprfResponse = await fetch('http://localhost:3000/upload-binary', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/octet-stream'
    },
    body: binaryData
});
const result = await oprfResponse.arrayBuffer();
console.log(new Uint8Array(result));
```

### Pythonでの使用例

```python
import requests

# ヘルスチェック
response = requests.get('http://localhost:3000/')
print(response.json())

# ステータス確認
response = requests.get('http://localhost:3000/api/status')
print(response.json())

# OPRF処理
binary_data = b'\x01\x02\x03\x04\x05'
response = requests.post(
    'http://localhost:3000/upload-binary',
    data=binary_data,
    headers={'Content-Type': 'application/octet-stream'}
)
result = response.content
print(result)
```

## 🔄 バージョニング

APIのバージョンは以下の方法で管理されます：

- **URL**: 現在はバージョンなし（v1がデフォルト）
- **ヘッダー**: `API-Version: 1.0.0`
- **レスポンス**: バージョン情報を含む

将来のバージョンでは、後方互換性を保ちながら新機能を追加する予定です。

## 📈 パフォーマンス

### 推奨設定

- **リクエストサイズ**: 最大10MB
- **同時接続**: 100接続まで
- **タイムアウト**: 30秒

### 最適化のヒント

1. **バイナリデータ**: 可能な限り圧縮して送信
2. **バッチ処理**: 複数のデータは個別に処理
3. **接続の再利用**: HTTP/1.1のKeep-Aliveを活用

---

**注意**: このAPIは開発・研究目的で作成されています。本番環境での使用前に、セキュリティ要件とパフォーマンス要件を十分に確認してください。
