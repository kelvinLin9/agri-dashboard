# Google Cloud 前端部署腳本
# 使用方式: .\deploy-to-gcloud.ps1

# 顏色輸出函數
function Write-ColorOutput {
    param([string]$Color, [string]$Message)
    $colors = @{
        'Green'  = 'Green'
        'Yellow' = 'Yellow'
        'Red'    = 'Red'
        'Cyan'   = 'Cyan'
    }
    Write-Host $Message -ForegroundColor $colors[$Color]
}

Write-ColorOutput Green "🚀 開始部署前端到 Google Cloud Run..."

# ===== 配置區域 =====
$PROJECT_ID = "agri-backend"  # 你的專案 ID
$SERVICE_NAME = "agri-dashboard"
$REGION = "asia-east1"

# 環境變數
$VITE_API_URL = "https://agri-backend-660672910950.asia-east1.run.app/api"
$VITE_GOOGLE_CLIENT_ID = "660672910950-a4tdqj33tt75q0lahnhm00l6oj9m7kvo.apps.googleusercontent.com"  # 請填入你的 Google Client ID

# ===== 檢查必要工具 =====
Write-ColorOutput Cyan "`n[1/5] 檢查 Google Cloud CLI..."
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "❌ 找不到 gcloud 命令"
    Write-ColorOutput Yellow "請先安裝 Google Cloud CLI: https://cloud.google.com/sdk/docs/install"
    exit 1
}
Write-ColorOutput Green "✓ Google Cloud CLI 已安裝"

# ===== 檢查環境變數 =====
Write-ColorOutput Cyan "`n[2/5] 檢查環境變數..."

# 檢查 VITE_API_URL
if ([string]::IsNullOrEmpty($VITE_API_URL)) {
    Write-ColorOutput Red "❌ VITE_API_URL 未設定"
    Write-ColorOutput Yellow "請編輯此腳本並設定 VITE_API_URL"
    exit 1
}

# 檢查 VITE_GOOGLE_CLIENT_ID（允許為空，但會警告）
if ([string]::IsNullOrEmpty($VITE_GOOGLE_CLIENT_ID)) {
    Write-ColorOutput Yellow "⚠️  VITE_GOOGLE_CLIENT_ID 未設定"
    Write-ColorOutput Yellow "請編輯此腳本並設定 VITE_GOOGLE_CLIENT_ID"
    Write-ColorOutput Yellow "否則 Google OAuth 登入功能將無法使用"
    $continue = Read-Host "是否繼續部署？(y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-ColorOutput Green "✓ API URL: $VITE_API_URL"
if (-not [string]::IsNullOrEmpty($VITE_GOOGLE_CLIENT_ID)) {
    Write-ColorOutput Green "✓ Google Client ID: $VITE_GOOGLE_CLIENT_ID"
}

# ===== 設定專案 =====
Write-ColorOutput Cyan "`n[3/5] 設定 GCloud 專案..."
gcloud config set project $PROJECT_ID

# ===== 檢查 Dockerfile =====
Write-ColorOutput Cyan "`n[4/5] 檢查 Dockerfile..."
if (-not (Test-Path "Dockerfile")) {
    Write-ColorOutput Red "❌ 找不到 Dockerfile"
    exit 1
}
Write-ColorOutput Green "✓ Dockerfile 存在"

# ===== 開始部署 =====
Write-ColorOutput Cyan "`n[5/5] 部署到 Cloud Run..."

# 建構部署指令
# 注意：只傳入非空的環境變數，避免空字串覆蓋 .env.production 的預設值
$buildEnvVars = "VITE_API_URL=$VITE_API_URL"

if (-not [string]::IsNullOrEmpty($VITE_GOOGLE_CLIENT_ID)) {
    $buildEnvVars += ",VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID"
}

$deployCmd = "gcloud run deploy $SERVICE_NAME " +
    "--source . " +
    "--platform managed " +
    "--region $REGION " +
    "--allow-unauthenticated " +
    "--port 8080 " +
    "--memory 512Mi " +
    "--cpu 1 " +
    "--min-instances 0 " +
    "--max-instances 10 " +
    "--set-build-env-vars=""$buildEnvVars"""

Write-ColorOutput Yellow "執行命令: $deployCmd"
Write-Host ""

# 執行部署
Invoke-Expression $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput Green "`n✅ 部署成功！"
    Write-ColorOutput Cyan "`n服務資訊："
    Write-ColorOutput Cyan "  名稱: $SERVICE_NAME"
    Write-ColorOutput Cyan "  區域: $REGION"
    Write-ColorOutput Cyan "  專案: $PROJECT_ID"
    Write-ColorOutput Cyan "`n查看詳情："
    Write-ColorOutput Cyan "https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME`n"
    
    # 取得服務 URL
    Write-ColorOutput Cyan "取得服務 URL..."
    $serviceUrl = gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
    if ($serviceUrl) {
        Write-ColorOutput Green "`n🌐 前端網址: $serviceUrl"
        Write-ColorOutput Yellow "`n⚠️  重要提醒："
        Write-ColorOutput Yellow "1. 請將此網址新增到 Google OAuth 設定中"
        Write-ColorOutput Yellow "2. 更新後端 .env 的 FRONTEND_URL=$serviceUrl"
        Write-ColorOutput Yellow "3. 測試 Google 登入功能"
    }
} else {
    Write-ColorOutput Red "`n❌ 部署失敗"
    Write-ColorOutput Yellow "請檢查錯誤訊息並重試"
    exit 1
}

Write-ColorOutput Yellow "`n📝 後續步驟："
Write-ColorOutput Yellow "1. 在 Google Cloud Console 設定 OAuth 授權網址"
Write-ColorOutput Yellow "2. 更新後端 FRONTEND_URL 環境變數"
Write-ColorOutput Yellow "3. 重新部署後端（如果需要）"
Write-ColorOutput Yellow "4. 測試完整的登入流程"
