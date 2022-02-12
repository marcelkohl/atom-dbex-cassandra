'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import trigger from './trigger';
import fieldType from './field-type';
import {default as ResultSet} from '../dataModel/result-set';
import SqlPrettier from 'sql-prettier';

export class Table {
  get structType() {
    return 'Table';
  }

  getTables(connection, database, onDone, logger, tableName) {
    let specificTable = tableName ? ` AND T.TABLE_NAME = '${tableName}'` : '';
    let query = `
SELECT T.TABLE_TYPE, T.TABLE_SCHEMA, GROUP_CONCAT(DISTINCT TG.TRIGGER_NAME) as TABLE_TRIGGERS, C.TABLE_NAME, C.COLUMN_NAME, C.ORDINAL_POSITION, C.DATA_TYPE, C.COLUMN_TYPE, C.COLUMN_KEY, C.COLUMN_COMMENT
  FROM INFORMATION_SCHEMA.COLUMNS C
LEFT JOIN INFORMATION_SCHEMA.TABLES T ON T.TABLE_NAME = C.TABLE_NAME
LEFT JOIN INFORMATION_SCHEMA.TRIGGERS TG ON TG.EVENT_OBJECT_TABLE = C.TABLE_NAME
 WHERE C.TABLE_SCHEMA = '${database}' AND TABLE_TYPE <> 'VIEW' ${specificTable}
GROUP BY T.TABLE_TYPE, T.TABLE_SCHEMA, C.TABLE_NAME, C.COLUMN_NAME, C.ORDINAL_POSITION, C.DATA_TYPE, C.COLUMN_TYPE, C.COLUMN_KEY, C.COLUMN_COMMENT
ORDER BY C.TABLE_SCHEMA, C.TABLE_NAME, FIELD(C.COLUMN_KEY, 'PRI', 'UNI', 'MUL', '') ASC, C.ORDINAL_POSITION
`;

    logger.log(query);

    connection.query(query).then((results) => {
      let tables = [];
      let table = {label:undefined};
      let tableTriggers = [];

      results.forEach((record)=>{
        if (table.label !== record.TABLE_NAME) {
          if (table.name) {
            if (tableTriggers.length > 0) {
              table.children.push(
                new TreeItem({
                  label: 'Triggers',
                  name: record.TABLE_SCHEMA + "." + table.name,
                  icon: 'mariadb-trigger',
                  children: trigger.treeItemFromTriggerNames(tableTriggers, table.datasets.singleName, record.TABLE_SCHEMA),
                  details: tableTriggers.length,
                  collapsed: true,
                  datasets: {
                    triggers: record.TABLE_SCHEMA + "." + table.name,
                  },
                  actions: []
                })
              );
            }

            tables.push(table);
            tableTriggers = record.TABLE_TRIGGERS ? record.TABLE_TRIGGERS.split(',') : [];
          }

          table = new TreeItem({
            label: record.TABLE_NAME,
            name: record.TABLE_SCHEMA + "." + record.TABLE_NAME,
            icon: 'icon-table',
            children: [],
            details: "",
            collapsed: true,
            datasets: {
              singleSchema: record.TABLE_SCHEMA,
              singleName: record.TABLE_NAME,
              table: record.TABLE_SCHEMA + "." + record.TABLE_NAME,
            },
            actions: [
              new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
              // new ItemAction({name:"refresh", icon:"icon-refresh", description:"Refresh element"}),
            ]
          });
        }

        table.children.push(new TreeItem({
          label: record.COLUMN_NAME,
          name: record.TABLE_SCHEMA + "." + record.TABLE_NAME + "." + record.COLUMN_NAME,
          icon: record.COLUMN_KEY === "PRI" ? "icon-pk" : (record.COLUMN_KEY === "MUL" ? "icon-fk" : (record.COLUMN_KEY === "UNI" ? "icon-uk" : "icon-field")),
          details: record.COLUMN_TYPE,
          collapsed: true,
          datasets: {
            field: record.TABLE_SCHEMA + "." + record.TABLE_NAME + "." + record.COLUMN_NAME
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

    connection.query(query).then((results) => {
      let fieldNames = Object.keys(results[0]);
      let fields = results.meta.map((f, i)=>Object.assign(f, {title: fieldNames[i]}));

      let resultSet = new ResultSet({
        columns: fields.map((f)=>{
          return {
            name: f.title,
            type: fieldType(f.columnType)
          };
        }),
        data: results.map((r)=>Object.values(r)),
        query: query,
        grammar: 'source.sql',
      });

      onDone(resultSet);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  getDataStructure(structureName, connection, onDone, logger) {
    let query = `SHOW CREATE ${this.structType} ${structureName}`;

    logger.log(query);

    connection.query(query).then((results) => {
      onDone(
        new ResultSet({
          query: SqlPrettier.format(
            results[0][`Create ${this.structType}`]
          ),
          grammar: 'source.sql',
        })
      );

      return;
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  getTablesNode(databaseName, tables) {
    return new TreeItem({
      label: 'Tables',
      name: databaseName + ".tables",
      icon: 'icon-table',
      children: tables,
      details: tables.length,
      collapsed: true,
      datasets: {
        tables: databaseName,
      },
      actions: []
    });
  }
}

export default new Table();
