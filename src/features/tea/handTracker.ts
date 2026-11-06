import type { HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision'

/**
 * MediaPipe HandLandmarker 的本地加载器。
 *
 * - 只从本站 public/media/tea/models 加载，不做 CDN 回退，避免把画面或请求
 *   发到第三方；也不会上传任何视频帧。
 * - @mediapipe/tasks-vision 用动态 import，避免把识别库塞进首屏 bundle。
 * - 先尝试 GPU delegate，失败再退回 CPU。
 */
export const MEDIA_BASE = `${import.meta.env.BASE_URL}media/tea/models`
export const WASM_BASE = `${MEDIA_BASE}/wasm`
export const MODEL_PATH = `${MEDIA_BASE}/hand_landmarker.task`

let instance: HandLandmarker | null = null
let initPromise: Promise<HandLandmarker> | null = null

export class HandModelError extends Error {
  readonly code: 'wasm' | 'model' | 'unknown'

  constructor(code: 'wasm' | 'model' | 'unknown', message: string) {
    super(message)
    this.name = 'HandModelError'
    this.code = code
  }
}

async function createWithDelegate(delegate: 'GPU' | 'CPU'): Promise<HandLandmarker> {
  const { FilesetResolver, HandLandmarker: HandLandmarkerClass } = await import(
    '@mediapipe/tasks-vision'
  )
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE)
  return HandLandmarkerClass.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
      delegate,
    },
    runningMode: 'VIDEO',
    numHands: 2,
  })
}

async function load(): Promise<HandLandmarker> {
  try {
    return await createWithDelegate('GPU')
  } catch (gpuError) {
    try {
      return await createWithDelegate('CPU')
    } catch (cpuError) {
      const detail =
        cpuError instanceof Error ? cpuError.message : String(cpuError ?? gpuError ?? '')
      throw new HandModelError(
        'model',
        `无法加载本地手势模型（${MODEL_PATH}）。请检查 public/media/tea/models 下的模型与 wasm 文件是否完整。${detail ? ` 详情：${detail}` : ''}`,
      )
    }
  }
}

/** 单例加载；失败后允许再次点击重试 */
export function getHandLandmarker(): Promise<HandLandmarker> {
  if (instance) return Promise.resolve(instance)
  if (initPromise) return initPromise
  initPromise = load()
    .then((landmarker) => {
      instance = landmarker
      return landmarker
    })
    .catch((err: unknown) => {
      initPromise = null
      throw err
    })
  return initPromise
}

export function detectForVideo(video: HTMLVideoElement, timestampMs: number): HandLandmarkerResult {
  if (!instance) throw new Error('HandLandmarker 尚未加载')
  return instance.detectForVideo(video, timestampMs)
}

/** 页面长期离开时可释放识别器；当前不主动调用，便于再次进入时复用 */
export function releaseHandLandmarker(): void {
  if (instance) {
    instance.close()
    instance = null
  }
  initPromise = null
}
