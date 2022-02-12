'use babel';

import TreeItem from '../dataModel/tree-item';
import {Routine as RoutineClass} from './routine';

class Func extends RoutineClass {
  get type() {
    return 'FUNCTION';
  }

  get iconClass() {
    return 'mariadb-function';
  }

  getFunctionsNode(databaseName, funcs) {
    return new TreeItem({
      label: 'Functions',
      name: databaseName + ".functions",
      icon: 'mariadb-function',
      children: funcs,
      details: funcs.length,
      collapsed: true,
      datasets: {
        functions: databaseName,
      },
      actions: []
    });
  }
}

export default new Func();
