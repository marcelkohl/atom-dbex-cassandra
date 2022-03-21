'use babel';

import TreeItem from '../dataModel/tree-item';
// import ItemAction from '../dataModel/item-action';
// import trigger from './trigger';
import {default as fieldType, TYPE_DESCRIPTION} from './field-type';
import {default as ResultSet} from '../dataModel/result-set';
// import SqlPrettier from 'sql-prettier';

export class Table {
  get structType() {
    return 'Table';
  }

  getTables(connection, keyspaceName, onDone, logger, tableName) {
    console.log("getTables --> ", connection)
//     let specificTable = tableName ? ` AND T.TABLE_NAME = '${tableName}'` : '';
    let query = `
SELECT * FROM system_schema.columns WHERE keyspace_name='${keyspaceName}' order by table_name, column_name
`;
// SELECT T.TABLE_TYPE, T.TABLE_SCHEMA, GROUP_CONCAT(DISTINCT TG.TRIGGER_NAME) as TABLE_TRIGGERS, C.TABLE_NAME, C.COLUMN_NAME, C.ORDINAL_POSITION, C.DATA_TYPE, C.COLUMN_TYPE, C.COLUMN_KEY, C.COLUMN_COMMENT
//   FROM INFORMATION_SCHEMA.COLUMNS C
// LEFT JOIN INFORMATION_SCHEMA.TABLES T ON T.TABLE_NAME = C.TABLE_NAME
// LEFT JOIN INFORMATION_SCHEMA.TRIGGERS TG ON TG.EVENT_OBJECT_TABLE = C.TABLE_NAME
//  WHERE C.TABLE_SCHEMA = '${database}' AND TABLE_TYPE <> 'VIEW' ${specificTable}
// GROUP BY T.TABLE_TYPE, T.TABLE_SCHEMA, C.TABLE_NAME, C.COLUMN_NAME, C.ORDINAL_POSITION, C.DATA_TYPE, C.COLUMN_TYPE, C.COLUMN_KEY, C.COLUMN_COMMENT
// ORDER BY C.TABLE_SCHEMA, C.TABLE_NAME, FIELD(C.COLUMN_KEY, 'PRI', 'UNI', 'MUL', '') ASC, C.ORDINAL_POSITION
// `;

    logger.log(query);

//     connection.query(query).then((results) => {
    connection.execute(query).then((results) => {
      let tables = [];
      let table = {label:undefined};
      let tableTriggers = [];

      console.log("---->", results)

//       results.forEach((record)=>{
      results.rows.forEach((record)=>{
        // console.log("-->", record)
        if (table.label !== record.table_name) {
          if (table.name) {
//             if (tableTriggers.length > 0) {
//               table.children.push(
//                 new TreeItem({
//                   label: 'Triggers',
//                   name: record.TABLE_SCHEMA + "." + table.name,
//                   icon: 'cassandra-trigger',
//                   children: trigger.treeItemFromTriggerNames(tableTriggers, table.datasets.singleName, record.TABLE_SCHEMA),
//                   details: tableTriggers.length,
//                   collapsed: true,
//                   datasets: {
//                     triggers: record.TABLE_SCHEMA + "." + table.name,
//                   },
//                   actions: []
//                 })
//               );
//             }
//
            tables.push(table);
//             tableTriggers = record.TABLE_TRIGGERS ? record.TABLE_TRIGGERS.split(',') : [];
          }
//
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

//     connection.query(query).then((results) => {
    connection.execute(query).then((results) => {
      console.log("getContent results ----->", results)
//       let fieldNames = Object.keys(results[0]);
//       let fields = results.meta.map((f, i)=>Object.assign(f, {title: fieldNames[i]}));
      // let fields = results.columns.map(f => {})

      // let resultSet = new ResultSet({
      //   columns: results.columns.map(f => {
      //     return {
      //       name: f.name,
      //       type: 0,
      //       // type: TYPE.text,
      //       type: fieldType(f.type.code)
      //     };
      //   }),
      //   // data: [],
      //   data: results.rows.map(r => {
      //     return Object.values(r).map(v => (v != null && typeof v === "object") ? JSON.stringify(v) : v)
      //   }),
      //   query: query,
      //   grammar: 'source.sql',
      // });
      let resultSet = this.prepareResultSet(results, query)
      console.log("onDone ----->", resultSet)
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
          type: 0,
          // type: TYPE.text,
          type: fieldType(f.type.code)
        };
      }),
      // data: [],
      data: results.rows.map(r => {
        return Object.values(r).map(v => (v != null && typeof v === "object") ? JSON.stringify(v) : v)
      }),
      query: query,
      grammar: 'source.sql',
    });

    console.log('yyyyy ---->', results)
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
