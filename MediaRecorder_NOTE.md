1`1# MediaRecorder API Notes

本筆記整理自 [MDN Web Docs - MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)，涵蓋核心概念、常用方法與事件。

## 概述

`MediaRecorder` 介面提供了錄製媒體串流 (MediaStream) 的功能，可將錄製內容儲存為 `Blob` 物件。

## 1. 建構子 (Constructor)

### `new MediaRecorder(stream, options)`

建立一個新的 `MediaRecorder` 物件。

- **參數**:
  - `stream`: 要錄製的 `MediaStream` 物件 (例如來自 `getUserMedia` 或 `<canvas>`)。
  - `options` (可選): 設定錄製參數的物件。
    - `mimeType`: 指定錄製格式 (如 `"video/webm"`, `"video/mp4"`)。
    - `audioBitsPerSecond`:指定音訊位元率。
    - `videoBitsPerSecond`: 指定視訊位元率。
    - `bitsPerSecond`: 同時指定音訊與視訊的位元率。

## 2. 實例屬性 (Properties)

- `mimeType`: (唯讀) 回傳實際使用的 MIME type。
- `state`: (唯讀) 目前錄製狀態。
  - `"inactive"`: 未錄製。
  - `"recording"`: 錄製中。
  - `"paused"`: 暫停中。
- `stream`: (唯讀) 回傳建構時傳入的 `MediaStream`。
- `videoBitsPerSecond`: (唯讀) 實際使用的視訊位元率。
- `audioBitsPerSecond`: (唯讀) 實際使用的音訊位元率。

## 3. 靜態方法 (Static Methods)

### `MediaRecorder.isTypeSupported(mimeType)`

檢查瀏覽器是否支援特定的 MIME type。

- **回傳**: `Boolean` (支援則為 `true`)
- **範例**:
  ```javascript
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    console.log('MP4 is supported')
  }
  ```

## 4. 實例方法 (Instance Methods)

- `start(timeslice)`: 開始錄製。
  - `timeslice` (可選): 以毫秒為單位的時間片段。若指定此參數，`dataavailable` 事件會每隔這段時間觸發一次；若不指定，則會在停止錄製時一次觸發。
- `stop()`: 停止錄製。會觸發最後一次 `dataavailable` 事件，然後觸發 `stop` 事件。
- `pause()`: 暫停錄製。
- `resume()`: 恢復錄製。
- `requestData()`: 強制觸發 `dataavailable` 事件，取得目前累積的錄製資料 (Blob)，但不停止錄製。

## 5. 事件 (Events)

- `dataavailable`: 當有錄製資料可用時觸發。事件物件包含 `data` 屬性 (Blob)。
  - 觸發時機:
    1. `stop()` 被呼叫。
    2. `requestData()` 被呼叫。
    3. `timeslice` 時間到。
- `start`: 錄製開始時觸發。
- `stop`: 錄製結束時觸發。
- `pause`: 錄製暫停時觸發。
- `resume`: 錄製恢復時觸發。
- `error`: 發生錯誤時觸發。

## 6. 範例程式碼 (Basic Usage)

```javascript
// 1. 取得串流
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

// 2. 建立 MediaRecorder
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
const chunks = []

// 3. 監聽資料事件
mediaRecorder.ondataavailable = (e) => {
  if (e.data.size > 0) {
    chunks.push(e.data)
  }
}

// 4. 監聽停止事件
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' })
  const videoURL = URL.createObjectURL(blob)
  // 可以將 videoURL 設給 <video> 或下載
}

// 5. 開始錄製
mediaRecorder.start()

// ... 一段時間後 ...
// 6. 停止錄製
mediaRecorder.stop()
```
