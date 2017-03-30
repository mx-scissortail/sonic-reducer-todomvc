import React from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import {atomConnector} from 'sonic-reducer';

import store from 'store';

// a component for displaying a single todo item
// subscribes to atomic todo objects provided through the "todo" prop
// which are subsequently flattened into props by atomConnector
const Todo = atomConnector("todo")(({todo, title, completed, editing, editValue}) => (
  <li className={cn({completed, editing})}>
    <div className="view">
      <input className="toggle" type="checkbox" checked={completed} onChange={todo.toggle} />
      <label onDoubleClick={todo.edit}>{title}</label>
      <button className="destroy" onClick={todo.destroy} />
    </div>
    {editing && <input className="edit" type="text" autoFocus="true" defaultValue={title} onKeyDown={todo.handleInput} onBlur={todo.handleInput} />}
  </li>
));

// the main view
// subscribes directly to the store
const TodoApp = atomConnector(store)(({todos, router: {route, hash}}) => {
  const remaining = todos.all.length - todos.completed.length;
  const displayItems = todos.all.length > 0 ? 'block' : 'none';

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input className="new-todo" type="text" autoFocus="true" placeholder="What needs to be done?" onKeyDown={handleHeaderInput} />
      </header>
      <section className="main" style={{display: displayItems}}>
        <input className="toggle-all" type="checkbox" checked={!todos.active.length} onChange={store.toggleAll} />
        <ul className="todo-list">
          {todos[route].map((todo) => <Todo key={todo().id} todo={todo} />)}
        </ul>
      </section>
      <footer className="footer" style={{display: displayItems}}>
        <span className="todo-count"><strong>{remaining}</strong> item{remaining != 1 ? 's' : ''} left</span>
        <ul className="filters">
          <li><a href={'#/'} className={cn({selected: hash == '#/'})}>All</a></li>
          <li><a href={'#/active'} className={cn({selected: hash == '#/active'})}>Active</a></li>
          <li><a href={'#/completed'} className={cn({selected: hash == '#/completed'})}>Completed</a></li>
        </ul>
        <button className="clear-completed" style={{display: todos.completed.length ? 'block' : 'none'}} onClick={store.clearCompleted}>Clear completed</button>
      </footer>
    </section>
  );
});

function handleHeaderInput (event) {
  const value = event.target.value.trim();
  if (event.which == ENTER_KEY && value) {
    store.add(value);
    event.target.value = '';
  }
}

ReactDOM.render(<TodoApp />, document.getElementById('root'));
