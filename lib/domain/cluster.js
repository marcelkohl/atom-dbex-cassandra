'use babel';

import TreeItem from '../dataModel/tree-item';
import table from './table';
import type from './type';

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
        console.error("query failed", err)
        resolve(err);
        return;
    });
  }

  tableTopic(keyspace) {
    return {
      query: `SELECT COUNT(table_name) as tables FROM system_schema.tables where keyspace_name='${keyspace}'`,
      parser: results => {
        if (results.rows[0].tables > 0) {
          let tablesNode = table.getTablesNode(keyspace, []);
          tablesNode.details = results.rows[0].tables;

          return tablesNode;
        }
      }
    }
  }

  typeTopic(keyspace) {
    return {
      query: `SELECT COUNT(type_name) as types FROM system_schema.types where keyspace_name='${keyspace}'`,
      parser: results => {
        if (results.rows[0].types > 0) {
          let typesNode = type.getTypesNode(keyspace, []);
          typesNode.details = results.rows[0].types;

          return typesNode;
        }
      }
    }
  }

  getTopics(connection, keyspace, onDone, logger) {
    let jobs = [this.tableTopic, this.typeTopic]
    let result = []
    let jobsCounter = 0;

    jobs.forEach(job => {
      let topic = job(keyspace)

      connection.execute(topic.query).then((results) => {
        logger.log(topic.query);

        topicResult = topic.parser(results)

        if (topicResult) {
          result.push(topicResult);
        }

        jobsCounter++

        if (jobsCounter == jobs.length) {
          onDone(result);
        }
      }).catch(err=>{
        console.error("query failed", err)

        jobsCounter++

        if (jobsCounter == jobs.length) {
          onDone(result);
        }
      });
    });
  }
}

export default new Cluster();
