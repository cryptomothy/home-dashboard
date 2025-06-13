<script lang="ts">
  import { Settings2Icon, XIcon } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let availableWidgets: Array<{
    name: string;
    active: boolean;
    component: any;
  }>;

  const dispatch = createEventDispatcher();

  function toggleWidget(index: number) {
    availableWidgets[index].active = !availableWidgets[index].active;
    dispatch('update', availableWidgets);
  }

  function closeModal() {
    dispatch('close');
  }

  // Empêcher la propagation du clic sur la modale
  function handleModalClick(event: MouseEvent) {
    event.stopPropagation();
  }
</script>

<div
  class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  on:click={closeModal}
>
  <div
    class="glassmorphism rounded-2xl overflow-hidden w-full max-w-md mx-4"
    on:click={handleModalClick}
  >
    <div class="p-4 border-b border-purple-500/30 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <Settings2Icon class="h-4 w-4 text-purple-400" />
        <span class="text-sm font-mono text-purple-300 uppercase tracking-wider"
          >Paramètres des widgets</span
        >
      </div>
      <button on:click={closeModal} class="p-1 rounded-lg hover:bg-purple-500/20 transition-all">
        <XIcon class="h-4 w-4 text-purple-400" />
      </button>
    </div>

    <div class="p-4">
      <div class="space-y-3">
        {#each availableWidgets as widget, index}
          <div
            class="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/30"
          >
            <span class="text-sm font-mono text-white capitalize">{widget.name}</span>
            <button
              on:click={() => toggleWidget(index)}
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {widget.active
                ? 'bg-green-500/20'
                : 'bg-purple-500/20'}"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {widget.active
                  ? 'translate-x-6'
                  : 'translate-x-1'}"
              />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
