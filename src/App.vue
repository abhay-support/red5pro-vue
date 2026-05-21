<script setup lang="ts">
import { ref, computed } from 'vue'
import VideoPlayer from './components/VideoPlayer.vue'

const host = ref('userid-123.red5.net')
const streamName = ref('stream1')
const nodeGroup = ref('Bas-123')

const subscribed = ref(false)
const statusMessage = ref('Idle')
const errorMessage = ref('')

const canSubscribe = computed(
  () => host.value.trim() !== '' && streamName.value.trim() !== '' && nodeGroup.value.trim() !== '',
)

function toggleSubscription() {
  errorMessage.value = ''
  subscribed.value = !subscribed.value
  if (subscribed.value) {
    statusMessage.value = 'Connecting...'
  }
}

function handleStatus(msg: string) {
  statusMessage.value = msg
  if (msg === 'Stopped' || msg === 'Disconnected') {
    subscribed.value = false
  }
}

function handleError(msg: string) {
  errorMessage.value = msg
  subscribed.value = false
}

const statusClass = computed(() => ({
  'status--live': statusMessage.value === 'Live',
  'status--connecting': statusMessage.value === 'Connecting...' || statusMessage.value === 'Retrying...',
  'status--error': statusMessage.value === 'Error',
  'status--idle': statusMessage.value === 'Idle' || statusMessage.value === 'Stopped' || statusMessage.value === 'Disconnected',
}))
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="brand">
        <span class="brand-name">Red5 WHEP Viewer</span>
      </div>
    </header>

    <main class="app-main">
      <section class="config-panel">
        <h2 class="panel-title">Stream Configuration</h2>

        <form class="config-form" @submit.prevent>
          <div class="field">
            <label for="host" class="field-label">Host URL</label>
            <input
              id="host"
              v-model="host"
              type="text"
              class="field-input"
              placeholder="userid-123.red5.net"
              :disabled="subscribed"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="field">
            <label for="stream-name" class="field-label">Stream Name</label>
            <input
              id="stream-name"
              v-model="streamName"
              type="text"
              class="field-input"
              placeholder="stream1"
              :disabled="subscribed"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="field">
            <label for="node-group" class="field-label">Node Group</label>
            <input
              id="node-group"
              v-model="nodeGroup"
              type="text"
              class="field-input"
              placeholder="Bas-123"
              :disabled="subscribed"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="form-footer">
            <div class="status-row">
              <span class="status-dot" :class="statusClass" />
              <span class="status-label" :class="statusClass">{{ statusMessage }}</span>
            </div>
            <button
              type="button"
              class="btn-toggle"
              :class="{ 'btn-toggle--active': subscribed }"
              :disabled="!canSubscribe"
              @click="toggleSubscription"
            >
              {{ subscribed ? 'Unsubscribe' : 'Subscribe' }}
            </button>
          </div>
        </form>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </section>

      <section class="player-panel">
        <VideoPlayer
          :host="host"
          :stream-name="streamName"
          :node-group="nodeGroup"
          :subscribed="subscribed"
          @status="handleStatus"
          @error="handleError"
        />
        <p class="stream-info" v-if="subscribed || statusMessage !== 'Idle'">
          <span class="stream-info-item">
            <span class="stream-info-key">Host</span>
            <span class="stream-info-value">{{ host }}</span>
          </span>
          <span class="stream-info-sep">/</span>
          <span class="stream-info-item">
            <span class="stream-info-key">Stream</span>
            <span class="stream-info-value">{{ streamName }}</span>
          </span>
          <span class="stream-info-sep">/</span>
          <span class="stream-info-item">
            <span class="stream-info-key">Node Group</span>
            <span class="stream-info-value">{{ nodeGroup }}</span>
          </span>
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.app-header {
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 28px;
  height: 28px;
  background: var(--color-accent);
  color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 0;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px;
  box-sizing: border-box;
  gap: 24px;
  align-items: start;
}

.config-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0 0 20px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.field-input {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-primary);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.field-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-muted);
  flex-shrink: 0;
  transition: background 0.2s;
}

.status-dot.status--live {
  background: #22c55e;
  box-shadow: 0 0 0 3px color-mix(in srgb, #22c55e 25%, transparent);
  animation: pulse 2s infinite;
}

.status-dot.status--connecting {
  background: #f59e0b;
  animation: pulse 1s infinite;
}

.status-dot.status--error {
  background: #ef4444;
}

.status-label {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.status-label.status--live {
  color: #22c55e;
}

.status-label.status--connecting {
  color: #f59e0b;
}

.status-label.status--error {
  color: #ef4444;
}

.btn-toggle {
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: var(--color-accent);
  color: #fff;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  letter-spacing: -0.01em;
}

.btn-toggle:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn-toggle:active:not(:disabled) {
  transform: scale(0.97);
}

.btn-toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-toggle--active {
  background: #ef4444;
}

.btn-toggle--active:hover:not(:disabled) {
  background: #dc2626;
}

.error-message {
  margin: 16px 0 0;
  padding: 10px 12px;
  background: color-mix(in srgb, #ef4444 12%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
  border-radius: 7px;
  font-size: 13px;
  color: #ef4444;
  word-break: break-word;
}

.player-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stream-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 0 2px;
}

.stream-info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stream-info-key {
  color: var(--color-text-muted);
  font-weight: 500;
}

.stream-info-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--color-text-secondary);
}

.stream-info-sep {
  color: var(--color-border);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .app-main {
    grid-template-columns: 1fr;
    padding: 16px;
  }
}
</style>
