'use babel';

import TreeItem from '../dataModel/tree-item';
import {default as ResultSet} from '../dataModel/result-set';

class Func {
  getFunctions(connection, keyspaceName, onDone, logger, tableName) {
    let query = `SELECT * FROM system_schema.functions WHERE keyspace_name='${keyspaceName}' order by function_name`;

    logger.log(query);

    connection.execute(query).then((results) => {
      let funcs = [];

      results.rows.forEach((record)=>{
        funcEl = new TreeItem({
          label: record.function_name,
          name: record.keyspace_name + "." + record.function_name,
          icon: 'cassandra-function',
          children: [],
          details: record.language,
          collapsed: true,
          datasets: {
            singleSchema: record.keyspace_name,
            singleName: record.function_name,
            func: record.keyspace_name + "." + record.function_name,
          },
        });

        funcs.push(funcEl)
      });

      onDone(funcs);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  getFunctionsNode(keyspaceName, funcs) {
    return new TreeItem({
      label: 'Functions',
      name: keyspaceName + ".functions",
      icon: 'cassandra-function',
      children: funcs,
      details: funcs.length,
      collapsed: true,
      datasets: {
        functions: keyspaceName,
      },
      actions: []
    });
  }

  describe(connection, funcName, onDone, logger, tableName) {
    let query = `DESCRIBE FUNCTION ${funcName}`;

    logger.log(query);
    connection.execute(query).then((results) => {
      let describe = new ResultSet({});

      if (results.rows.length > 0 && results.rows[0].create_statement) {
        describe.query = results.rows[0].create_statement;
        describe.grammar = 'source.sql';
      }

      onDone(describe);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }
}

export default new Func();
