'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import {default as ResultSet, TYPE} from '../dataModel/result-set';
import pascalCase from '../helper/pascal-case';
import SqlPrettier from 'sql-prettier';

class Trigger {
  treeItemFromTriggerNames(triggerNames, tableName, schema) {
    let results = [];

    triggerNames.forEach((trigger)=>{
      results.push(new TreeItem({
        label: trigger,
        name: schema + "." + trigger,
        icon: 'mariadb-trigger',
        children: [],
        details: "",
        collapsed: true,
        datasets: {
          triggerSchema: schema,
          trigger: trigger,
          triggerTable: tableName
        },
        actions: [
          new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
        ]
      }));
    });

    return results;
  }

  getContent(connection, triggerName, triggerSchema, triggerTable, onDone, logger) {
    let query = `
SELECT *
  FROM INFORMATION_SCHEMA.TRIGGERS
 WHERE TRIGGER_NAME='${triggerName}'
   AND TRIGGER_SCHEMA='${triggerSchema}'
   AND EVENT_OBJECT_TABLE = '${triggerTable}'
`;

    logger.log(query);

    connection.query(query).then((results) => {
      let resultSet = new ResultSet({
        columns: [
          {name: 'Key', type: TYPE.text},
          {name: 'Value', type: TYPE.text},
        ],
        data: Object.keys(results[0]).map((key)=>[
          pascalCase(key),
          results[0][key]
        ]),
        grammar: 'source.sql',
      });

      onDone(resultSet);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  getStructure(triggerName, connection, onDone, logger) {
    let query = `SHOW CREATE TRIGGER ${triggerName}`;

    logger.log(query);

    connection.query(query).then((results) => {
      onDone(
        new ResultSet({
          query: SqlPrettier.format(
            results[0][`SQL Original Statement`]
          )
        })
      );

      return;
    }).catch(err=>{
      onDone(err);
      return;
    });
  }
}

export default new Trigger();
