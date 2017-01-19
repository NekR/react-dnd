import preact, { Component } from 'preact';
import { DragDropManager } from 'dnd-core';
import invariant from 'invariant';
import checkDecoratorArguments from './utils/checkDecoratorArguments';
import hoistStatics from 'hoist-non-react-statics';

export default function DragDropContext(backendOrModule) {
  checkDecoratorArguments('DragDropContext', 'backend', ...arguments);

  // Auto-detect ES6 default export for people still using ES5
  let backend;
  if (typeof backendOrModule === 'object' && typeof backendOrModule.default === 'function') {
    backend = backendOrModule.default;
  } else {
    backend = backendOrModule;
  }

  invariant(
    typeof backend === 'function',
    'Expected the backend to be a function or an ES6 module exporting a default function. ' +
    'Read more: http://gaearon.github.io/react-dnd/docs-drag-drop-context.html'
  );

  const childContext = {
    dragDropManager: new DragDropManager(backend)
  };

  return function decorateContext(DecoratedComponent) {
    const displayName =
      DecoratedComponent.displayName ||
      DecoratedComponent.name ||
      'Component';

    class DragDropContextContainer extends Component {
      static DecoratedComponent = DecoratedComponent;

      static displayName = `DragDropContext(${displayName})`;

      getDecoratedComponentInstance() {
        return this.child;
      }

      getManager() {
        return childContext.dragDropManager;
      }

      getChildContext() {
        return childContext;
      }

      setChildRef = (child) => {
        this.child = child;
      }

      render() {
        return (
          <DecoratedComponent {...this.props} ref={this.setChildRef} />
        );
      }
    }

    return hoistStatics(DragDropContextContainer, DecoratedComponent);
  };
}
