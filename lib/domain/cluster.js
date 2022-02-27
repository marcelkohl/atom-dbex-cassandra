'use babel';

import TreeItem from '../dataModel/tree-item';
import table from './table';

class Cluster {
  getKeyspaces(connection, resolve, logger) {
    let query = `DESCRIBE KEYSPACES`;

    logger.log(query);

    connection.execute(query).then((results) => {
      let keyspaces = [];
      let keyspace = {label:undefined};

      results.rows.forEach((record)=>{
        keyspace = new TreeItem({
          label: record.keyspace_name,
          name: record.keyspace_name,
          icon: 'icon-database',
          datasets: {
            keyspace: record.keyspace_name,
          },
          actions: []
        });

        keyspaces.push(keyspace);
      });

      resolve(keyspaces);
    }).catch(err=>{
        console.log("query failed", err)
        resolve(err);
        return;
    });
  }

  getTopics(connection, keyspace, onDone, logger) {
    console.log("getTopics ---> ", connection)
    let query = `
    SELECT COUNT(table_name) as tables FROM system_schema.tables where keyspace_name='${keyspace}'
`;
// SELECT
//   (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA='${database}') as views,
//   (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE <> 'VIEW' AND TABLE_SCHEMA='${database}') as tables,
//   (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'FUNCTION' AND ROUTINE_SCHEMA='${database}') as functions,
//   (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA='${database}') as procedures,
//   (SELECT COUNT(EVENT_SCHEMA) FROM INFORMATION_SCHEMA.EVENTS WHERE EVENT_SCHEMA='od_bot_dev') as events
// `;

    logger.log(query);

    connection.execute(query).then((results) => {
//     connection.query(query).then((results) => {
      let record = results.rows[0];
      let result = [];

      // results.rows.forEach((record)=>{

      if (record.tables > 0) {
        let tablesNode = table.getTablesNode(keyspace, []);
        tablesNode.details = record.tables;

        result.push(tablesNode);
      }
//
//       if (record.views > 0) {
//         let viewsNode = view.getViewsNode(database, []);
//         viewsNode.details = record.views;
//
//         result.push(viewsNode);
//       }
//
//       if (record.functions > 0) {
//         let funcsNode = func.getFunctionsNode(database, []);
//         funcsNode.details = record.functions;
//
//         result.push(funcsNode);
//       }
//
//       if (record.procedures > 0) {
//         let procsNode = proc.getProceduresNode(database, []);
//         procsNode.details = record.procedures;
//
//         result.push(procsNode);
//       }
//
//       if (record.events) {
//         let eventsNode = generalEvents.getEventsNode(database, []);
//         eventsNode.details = record.events;
//
//         result.push(eventsNode);
      // }

      onDone(result);
    }).catch(err=>{
      console.log("query failed", err)
      onDone(err);
      return;
    });
  }
}

export default new Cluster();
