<script setup lang="ts">
// Vue Dashboard Component
</script>

<template>
  <div class="dashboard-container">
    <header class="header">
      <h1 class="title">
        Vue 3 Visora Demo
      </h1>
      <p class="subtitle">
        Hover over these elements with Visora running. You should see the inspector outline them and identify the exact source file and component!
      </p>
    </header>
    
    <div class="grid">
      <div class="card">
        <div class="icon-wrapper blue">
          <span class="icon">⚡</span>
        </div>
        <h3 class="card-title">Instant Feedback</h3>
        <p class="card-text">Visora connects directly to the Vue 3 component tree.</p>
      </div>
      
      <div class="card">
        <div class="icon-wrapper purple">
          <span class="icon">🧠</span>
        </div>
        <h3 class="card-title">AI Powered</h3>
        <p class="card-text">Shift+Click to edit this component using the Visora AI Patcher.</p>
      </div>
      
      <div class="card">
        <div class="icon-wrapper green">
          <span class="icon">🚀</span>
        </div>
        <h3 class="card-title">Universal Extraction</h3>
        <p class="card-text">Works natively in Vue 3 development mode with zero AST parsing.</p>
      </div>
    </div>
    
    <footer class="footer">
      <p>Built for the Visora V2 Multi-Framework Engine.</p>
    </footer>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #111827;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.header {
  margin-bottom: 3rem;
  text-align: center;
}

.title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(to right, #42d392, #647eff);
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  color: #9ca3af;
  max-width: 42rem;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 64rem;
}

.card {
  background-color: #1f2937;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #374151;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card:hover {
  border-color: #42d392;
  transform: translateY(-2px);
}

.icon-wrapper {
  height: 3rem;
  width: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.icon-wrapper.blue { background-color: rgba(59, 130, 246, 0.2); }
.icon-wrapper.purple { background-color: rgba(168, 85, 247, 0.2); }
.icon-wrapper.green { background-color: rgba(16, 185, 129, 0.2); }

.icon { font-size: 1.5rem; }

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.card-text {
  color: #9ca3af;
  line-height: 1.5;
}

.footer {
  margin-top: 4rem;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
