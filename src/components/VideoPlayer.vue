<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { WHEPClient, setLogLevel } from 'red5pro-webrtc-sdk'
import type { RTCWhepSubscriberConfigType } from 'red5pro-webrtc-sdk'

setLogLevel('debug')

interface Props {
  host: string
  streamName: string
  nodeGroup: string
  subscribed: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'error', message: string): void
  (e: 'status', message: string): void
}>()

const RETRY_DELAY_MS = 1000

const VIDEO_ELEMENT_ID = 'red5pro-subscriber'
const client = ref<WHEPClient | null>(null)
const retryTimer = ref<ReturnType<typeof setTimeout> | null>(null)

function clearRetryTimer() {
  if (retryTimer.value !== null) {
    clearTimeout(retryTimer.value)
    retryTimer.value = null
  }
}

async function clearClient() {
  if (client.value) {
    try {
      await client.value.unsubscribe()
    } catch {
      // swallow — already stopping
    }
    client.value = null
  }
}

async function startSubscription() {
  await clearClient()

  try {
    emit('status', 'Connecting...')

    const endpoint = `https://${props.host}/as/v1/proxy/whep/live/${props.streamName}`
    const config: RTCWhepSubscriberConfigType = {
      host: props.host,
      streamName: props.streamName,
      endpoint,
      mediaElementId: VIDEO_ELEMENT_ID,
      connectionParams: {
        nodeGroup: props.nodeGroup,
      },
    }

    const subscriber = new WHEPClient()
    subscriber.on('*', (event: { type: string }) => {
      const { type } = event
      if (type === 'Subscribe.Start') {
        emit('status', 'Live')
      } else if (type === 'Subscribe.Stop') {
        emit('status', 'Stopped')
      } else if (
        type === 'Subscribe.Connection.Closed' || 
        type === 'Connect.Failure' || 
        type === 'Subscribe.Play.Unpublish') {
        emit('status', 'Retrying...')
        clearClient().then(() => {
          if (props.subscribed) {
            retryTimer.value = setTimeout(() => {
              retryTimer.value = null
              if (props.subscribed) {
                startSubscription()
              }
            }, RETRY_DELAY_MS)
          }
        })
      }
    })

    await subscriber.init(config)
    await subscriber.subscribe()

    client.value = subscriber
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    emit('error', message)
    emit('status', 'Retrying...')
    await clearClient()

    if (props.subscribed) {
      retryTimer.value = setTimeout(() => {
        retryTimer.value = null
        if (props.subscribed) {
          startSubscription()
        }
      }, RETRY_DELAY_MS)
    }
  }
}

async function stopSubscription() {
  clearRetryTimer()
  await clearClient()
  emit('status', 'Idle')
}

watch(
  () => props.subscribed,
  (active) => {
    if (active) {
      startSubscription()
    } else {
      stopSubscription()
    }
  },
)

onUnmounted(() => {
  clearRetryTimer()
  clearClient()
})
</script>

<template>
  <div class="video-wrapper">
    <video
      :id="VIDEO_ELEMENT_ID"
      autoplay
      playsinline
      controls
    />
  </div>
</template>

<style scoped>
.video-wrapper {
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}
</style>
