import { Navigate } from 'react-router-dom'

/** 旧第二页地址落到历史介绍里的叙事线索。 */
export const YINGGE_STORY_REDIRECT = '/docs#doc-yingge-story'

/** 旧第二页地址。叙事线索在历史介绍英歌篇，这里只负责跳过去。 */
export default function YinggeStory() {
  return <Navigate to={YINGGE_STORY_REDIRECT} replace />
}
