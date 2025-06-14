<script lang="ts">
  import { onMount } from 'svelte';
  import { CheckCircle2Icon, CircleIcon, PlusIcon, Trash2Icon, LoaderIcon } from 'lucide-svelte';

  interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
  }

  let todos: Todo[] = [];
  let newTodoText = '';
  let loading = true;

  // Charger les todos depuis le localStorage
  onMount(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      todos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
      }));
    }
    loading = false;
  });

  // Sauvegarder les todos dans le localStorage
  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Ajouter un nouveau todo
  function addTodo() {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date(),
      };
      todos = [...todos, newTodo];
      newTodoText = '';
      saveTodos();
    }
  }

  // Toggle l'état d'un todo
  function toggleTodo(id: string) {
    todos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    saveTodos();
  }

  // Supprimer un todo
  function deleteTodo(id: string) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
  }

  // Gérer la touche Entrée
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      addTodo();
    }
  }
</script>

<div class="col-span-3 row-span-2 glassmorphism rounded-2xl overflow-hidden tech-glow-purple">
  <div class="p-3 flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <CheckCircle2Icon class="h-4 w-4 text-purple-400" />
        <span class="text-sm font-mono text-purple-300 uppercase tracking-wider">Todo List</span>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <div class="text-center">
          <LoaderIcon class="h-6 w-6 text-purple-400 animate-spin mx-auto mb-2" />
          <p class="text-xs text-gray-400 font-mono">Chargement...</p>
        </div>
      </div>
    {:else}
      <!-- Input pour nouveau todo -->
      <div class="mb-4">
        <div class="flex items-center space-x-2">
          <input
            type="text"
            bind:value={newTodoText}
            on:keydown={handleKeydown}
            placeholder="Ajouter une tâche..."
            class="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
          />
          <button
            on:click={addTodo}
            class="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
          >
            <PlusIcon class="h-4 w-4 text-purple-400" />
          </button>
        </div>
      </div>

      <!-- Liste des todos -->
      <div class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {#each todos as todo (todo.id)}
          <div
            class="flex items-center space-x-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer"
            on:click={() => toggleTodo(todo.id)}
          >
            <div class="flex-shrink-0">
              {#if todo.completed}
                <CheckCircle2Icon class="h-4 w-4 text-green-400" />
              {:else}
                <CircleIcon class="h-4 w-4 text-purple-400" />
              {/if}
            </div>
            <span
              class="flex-1 text-sm {todo.completed ? 'text-gray-500 line-through' : 'text-white'}"
            >
              {todo.text}
            </span>
            <button
              on:click|stopPropagation={() => deleteTodo(todo.id)}
              class="p-1 rounded-lg hover:bg-purple-500/30 transition-all"
            >
              <Trash2Icon class="h-3 w-3 text-red-400" />
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
