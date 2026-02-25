<script>
  import "../app.css";
  let { children } = $props();
</script>

<div class="layout">
  <header>
    <h1>Component Library</h1>
    <p>Headless component demos with Svelte 5</p>
  </header>

  <nav>
    <a href="/">Home</a>
    <a href="/text-field">TextField</a>
    <a href="/checkbox">Checkbox</a>
    <a href="/radio-group">RadioGroup</a>
    <a href="/select">Select</a>
    <a href="/multi-select">MultiSelect</a>
    <a href="/modal">Modal</a>
    <a href="/accordion">Accordion</a>
  </nav>

  <main>
    {@render children()}
  </main>
</div>

<style>
  .layout {
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  header {
    margin-bottom: 1.5rem;
  }

  header h1 {
    font-size: 1.5rem;
    font-weight: 700;
  }

  header p {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.875rem;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
