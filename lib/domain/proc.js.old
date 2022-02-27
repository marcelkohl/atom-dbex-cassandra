'use babel';

import TreeItem from '../dataModel/tree-item';
import {Routine as RoutineClass} from './routine';

class Proc extends RoutineClass {
  get type() {
    return 'PROCEDURE';
  }

  get iconClass() {
    return 'mariadb-procedure';
  }

  getProceduresNode(databaseName, procs) {
    return new TreeItem({
      label: 'Procedures',
      name: databaseName + ".procedures",
      icon: 'mariadb-procedure',
      children: procs,
      details: procs.length,
      collapsed: true,
      datasets: {
        procedures: databaseName,
      },
      actions: []
    });
  }
}

export default new Proc();
