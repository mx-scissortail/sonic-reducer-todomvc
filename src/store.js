import {subscribe} from 'zine';
import {actionSwitch, atomify, defineAtom, defineFormula, defineValueAtom, merge} from 'sonic-reducer';

// this first bit is a simple hash router store
var router = atomify(() => {
  const hash = window.location.hash;
  switch (hash) {
    case '#/active':
      return {hash, route: 'active'};
    case '#/completed':
      return {hash, route: 'completed'};
    default:
      return {hash: '#/', route: 'all'};
  }
});

router.update(); // get an initial state
window.addEventListener('hashchange', router.update);

// ...and a utility method
function updateLocalStorage () {
  localStorage.setItem('todos-react+sonic-reducer', JSON.stringify(allItems().map((todo) => {
    const {editing, id, title, completed} = todo();
    return {id, title, completed}; // ignore 'editing' status when serializing
  })));
}

// now we get on to building the main todo store
var store; // it's actually defined below

var nextID = 0;

function createTodo (todoData) {
  if (todoData.id >= nextID) { // increment nextID (ids loaded from localStorage may not start at 0)
    nextID = todoData.id + 1;
  }

  // create todo atom and add some methods
  const todo = defineAtom(merge, todoData);

  todo.edit = () => todo.update({editing: true});
  todo.destroy = () => store.destroy(todo);
  todo.toggle = () => {
    todo.update({completed: !todo().completed});
    store.refresh();
  };
  todo.handleInput = (event) => {
    const title = event.target.value.trim();
    if (event.which == ENTER_KEY || event.which === undefined) { // submit changes
      if (!title) {
        todo.destroy();
      } else {
        todo.update({title, editing: false});
      }
    } else if (event.which == ESCAPE_KEY) {
      todo.update({editing: false});
    }
  };

  subscribe(todo, updateLocalStorage); // update local storage whenever the todo is updated
  return todo;
}

// allItems is a simple atomic value array that starts with all the todos fetched from local storage
const allItems = defineValueAtom((JSON.parse(localStorage.getItem('todos-react+sonic-reducer')) || []).map(createTodo));

subscribe(allItems, updateLocalStorage); // update local storage whenever allItems updates

// finally, define the main store
// it's an atomic formula that converts the allItems and router atoms into a structured object
// and derives the 'active' and 'completed' categories from allItems
store = defineFormula((all, router) => ({
  todos: {
    all,
    active: all.filter((item) => !item().completed),
    completed: all.filter((item) => item().completed)
  },
  router
}), allItems, router);

// add some methods to the store, they mostly just update allItems
store.add = (title) => allItems.update([...allItems(), createTodo({id: nextID, completed: false, title})]);
store.clearCompleted = () => allItems.update(allItems().filter((todo) => !todo().completed));
store.destroy = (toDelete) => allItems.update(allItems().filter((todo) => todo != toDelete));
store.refresh = () => allItems.update(allItems());
store.toggleAll = () => {
  const {all, completed} = store().todos;
  const state = completed.length < all.length;
  allItems().forEach((todo) => {todo().completed = state;}); // this is a bit of a hack - we're (locally) mutating the todo objects without publishing them individually
  store.refresh(); // publish the whole store to update all at once
};

export default store;
