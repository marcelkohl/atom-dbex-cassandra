'use babel';

import TreeItem from '../dataModel/tree-item';
import table from './table';
import view from './view';
import proc from './proc';
import func from './func';
import generalEvents from './general-events';

class Database {
  getTopics(connection, database, onDone, logger) {
    let query = `
SELECT
  (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA='${database}') as views,
  (SELECT COUNT(TABLE_SCHEMA) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE <> 'VIEW' AND TABLE_SCHEMA='${database}') as tables,
  (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'FUNCTION' AND ROUTINE_SCHEMA='${database}') as functions,
  (SELECT COUNT(ROUTINE_SCHEMA) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA='${database}') as procedures,
  (SELECT COUNT(EVENT_SCHEMA) FROM INFORMATION_SCHEMA.EVENTS WHERE EVENT_SCHEMA='od_bot_dev') as events
`;

    logger.log(query);

    connection.query(query).then((results) => {
      let record = results[0];
      let result = [];

      if (record.tables > 0) {
        let tablesNode = table.getTablesNode(database, []);
        tablesNode.details = record.tables;

        result.push(tablesNode);
      }

      if (record.views > 0) {
        let viewsNode = view.getViewsNode(database, []);
        viewsNode.details = record.views;

        result.push(viewsNode);
      }

      if (record.functions > 0) {
        let funcsNode = func.getFunctionsNode(database, []);
        funcsNode.details = record.functions;

        result.push(funcsNode);
      }

      if (record.procedures > 0) {
        let procsNode = proc.getProceduresNode(database, []);
        procsNode.details = record.procedures;

        result.push(procsNode);
      }

      if (record.events) {
        let eventsNode = generalEvents.getEventsNode(database, []);
        eventsNode.details = record.events;

        result.push(eventsNode);
      }

      onDone(result);
    }).catch(err=>{
      console.log("query failed", err)
      console.log("error code", err.code)
      onDone(err);
      return;
    });
  }

  getSchemas(connection, resolve, logger) {
    let query = `
  SELECT schema_name AS database_name, COUNT(DISTINCT TABLE_NAME) AS total_tables
    FROM information_schema.schemata
    JOIN INFORMATION_SCHEMA.COLUMNS ON schema_name = TABLE_SCHEMA
GROUP BY schema_name
ORDER BY schema_name
`;

    logger.log(query);

    connection.query(query).then((results) => {
      let databases = [];
      let database = {label:undefined};

      results.forEach((record)=>{
        if (database.label !== record.database_name) {
          if (database.name) {
            databases.push(database);
          }

          database = new TreeItem({
            label: record.database_name,
            name: record.database_name,
            icon: 'icon-database',
            details: record.total_tables,
            collapsed: false,
            datasets: {
              database: record.database_name,
            },
            classes: ['mariadb-table-counter-detail'],
            actions: []
          });
        }
      });

      if (database.name) {
        databases.push(database);
      }

      resolve(databases);
    }).catch(err=>{
        console.log("query failed", err)
        console.log("error code", err.code)
        resolve(err);
        return;
    });
  }
}

export default new Database();
