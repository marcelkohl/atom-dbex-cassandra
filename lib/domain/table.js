'use babel';

import TreeItem from '../dataModel/tree-item';
import {default as fieldType, TYPE_DESCRIPTION} from './field-type';
import {default as ResultSet} from '../dataModel/result-set';

export class Table {
  get structType() {
    return 'Table';
  }

  getTables(connection, keyspaceName, onDone, logger, tableName) {
    let query = `SELECT * FROM system_schema.columns WHERE keyspace_name='${keyspaceName}' order by table_name, column_name`;

    logger.log(query);

    connection.execute(query).then((results) => {
      let tables = [];
      let table = {label:undefined};
      let tableTriggers = [];

      results.rows.forEach((record)=>{
        if (table.label !== record.table_name) {
          if (table.name) {
            tables.push(table);
          }

          table = new TreeItem({
            label: record.table_name,
            name: record.keyspace_name + "." + record.table_name,
            icon: 'icon-table',
            children: [],
            details: "",
            collapsed: true,
            datasets: {
              singleSchema: record.keyspace_name,
              singleName: record.table_name,
              table: record.keyspace_name + "." + record.table_name,
            },
            actions: [
//               new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
//               // new ItemAction({name:"refresh", icon:"icon-refresh", description:"Refresh element"}),
            ]
          });
        }

        table.children.push(new TreeItem({
          label: record.column_name,
          name: record.keyspace_name + "." + record.table_name + "." + record.column_name,
          icon: record.kind === "partition_key" ? "icon-pk" : "icon-field",
          details: record.type.replace(/</g, "(").replace(/>/g, ")"),
          collapsed: true,
          datasets: {
            field: record.keyspace_name + "." + record.table_name + "." + record.column_name
          },
          actions: [
            // new ItemAction({name:"edit", icon:"icon-edit"}),
            // new ItemAction({name:"delete", icon:"icon-delete"}),
          ]
        }));
      });

      if (table.name) {
        tables.push(table);
      }

      onDone(tables);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  getContent(connection, table, onDone, logger) {
    let query = `
SELECT *
  FROM ${table}
 LIMIT 100
`;

    logger.log(query);

    connection.execute(query).then((results) => {
      let resultSet = this.prepareResultSet(results, query)

      onDone(resultSet);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  prepareResultSet(results, query) {
    let resultSet = new ResultSet({
      columns: results.columns.map(f => {
        return {
          name: f.name,
          type: fieldType(f.type.code)
        };
      }),
      data: results.rows.map(r => {
        return Object.values(r).map(v => (v != null && typeof v === "object") ? JSON.stringify(v) : v)
      }),
      query: query,
      grammar: 'source.sql',
    });

    return resultSet;
  }

//   getDataStructure(structureName, connection, onDone, logger) {
//     let query = `SHOW CREATE ${this.structType} ${structureName}`;
//
//     logger.log(query);
//
//     connection.query(query).then((results) => {
//       onDone(
//         new ResultSet({
//           query: SqlPrettier.format(
//             results[0][`Create ${this.structType}`]
//           ),
//           grammar: 'source.sql',
//         })
//       );
//
//       return;
//     }).catch(err=>{
//       onDone(err);
//       return;
//     });
//   }

  getTablesNode(keyspaceName, tables) {
    return new TreeItem({
      label: 'Tables',
      name: keyspaceName + ".tables",
      icon: 'icon-table',
      children: tables,
      details: tables.length,
      collapsed: true,
      datasets: {
        tables: keyspaceName,
      },
      actions: []
    });
  }
}

export default new Table();
