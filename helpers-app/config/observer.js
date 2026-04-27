// config/observer.js — Observer pattern
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }

  off(event, listener) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
  }
}

// Global app event bus (singleton-style)
const appEvents = new EventEmitter();

// Built-in observers — log every significant action
appEvents.on('volunteer:joined', ({ taskTitle, volunteerId }) => {
  console.log(`[Observer] New volunteer "${volunteerId}" joined task: "${taskTitle}"`);
});

appEvents.on('volunteer:dismissed', ({ taskTitle, volunteerId }) => {
  console.log(`[Observer] Volunteer "${volunteerId}" dismissed from task: "${taskTitle}"`);
});

appEvents.on('task:created', ({ taskTitle, owner }) => {
  console.log(`[Observer] Task created: "${taskTitle}" by owner: "${owner}"`);
});

module.exports = appEvents;
