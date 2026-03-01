import { useRuntimeConfig } from '#imports'
import { createVersionedCatchAllProxyHandlerWithOptions } from '../../utils/proxy-handler-factory'

export default createVersionedCatchAllProxyHandlerWithOptions({
  version: 'v1',
  getUpstreamVersionPrefix: (event) => {
    return useRuntimeConfig(event).apiVersionProxy?.v1
  },
})
