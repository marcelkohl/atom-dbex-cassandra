'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import {default as ResultSet, TYPE} from '../dataModel/result-set';
import SqlPrettier from 'sql-prettier';
import pascalCase from '../helper/pascal-case';

class GeneralEvents {
  getAll(connection, database, onDone, logger, eventName) {
    let specificEvent = eventName ? ` AND EVENT_NAME = '${eventName}'` : '';
    let query = `
SELECT EVENT_SCHEMA, EVENT_NAME
  FROM INFORMATION_SCHEMA.EVENTS
 WHERE EVENT_SCHEMA='${database} ${specificEvent}'
`;

    logger.log(query);

    connection.query(query).then((results) => {
      let events = [];

      results.forEach((record)=>{
        events.push(new TreeItem({
          label: record.EVENT_NAME,
          name: record.EVENT_SCHEMA + "." + record.EVENT_NAME,
          icon: "mariadb-event",
          details: "",
          collapsed: true,
          datasets: {
            event: record.EVENT_NAME,
            schema: record.EVENT_SCHEMA,
          },
          actions: [
            new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
          ]
        }));
      });

      onDone(events);
    }).catch(err=>{
      console.log("query failed", err)
      console.log("error code", err.code)
      onDone(err);
      return;
    });
  }

  getStructure(eventName, connection, onDone, logger) {
    let query = `SHOW CREATE EVENT ${eventName}`;

    logger.log(query);

    connection.query(query).then((results) => {
      onDone(
        new ResultSet({
          query: SqlPrettier.format(
            results[0][`Create Event`]
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

  getContent(connection, eventName, onDone, logger) {
    let query = `
SELECT *
  FROM INFORMATION_SCHEMA.EVENTS
 WHERE EVENT_NAME='${eventName}'
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

  getEventsNode(databaseName, events) {
    return new TreeItem({
      label: 'Events',
      name: databaseName + ".events",
      icon: 'mariadb-event',
      children: events,
      details: events.length,
      collapsed: true,
      datasets: {
        events: databaseName,
      },
      actions: []
    });
  }
}

export default new GeneralEvents();
