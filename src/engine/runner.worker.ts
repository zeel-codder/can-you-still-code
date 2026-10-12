import { getCodeLevel } from '../levels'
import { evaluateCode } from './evaluate'

self.onmessage = (e: MessageEvent<{ levelId: string; code: string }>) => {
  self.postMessage(evaluateCode(getCodeLevel(e.data.levelId), e.data.code))
}
