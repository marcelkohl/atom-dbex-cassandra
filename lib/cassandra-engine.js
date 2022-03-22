'use babel';

import ConnectionSettings from './dataModel/connection-settings';
import FieldConnection from './dataModel/field-connection';
import cassandra from 'cassandra-driver';
import {default as ResultSet} from './dataModel/result-set';
import cluster from './domain/cluster';
import table from './domain/table';
import type from './domain/type';
import func from './domain/func';

const CONNECTION_NOT_EXIST = 'Connection Not Exist';

export default class CassandraEngine {
  /**
   * @param {Logger} logger Logger instance from dbex.
   */
  constructor(logger) {
    this.logger = logger;
    this.connections = {};
    this.running = {};
  }

  /**
   * This method is used when dbex needs to change the scope of logger.
   * Don't worry about how it works, dbex does all the job but this method must be available.
   *
   * @return {Logger}
   */
  getLogger() {
    return this.logger; // leave like this and everything is fine for this method.
  }

  /**
   * Engine name getter.
   *
   * @return {string} a name given to your engine.
   */
  getName() {
    return "atom-dbex-casandra";
  }

  /**
   * Engine icon getter.
   * Must be a css class that represents an icon for the connections created with this engine.
   * Take a look on the styles/style.less for more details.
   *
   * @return {string}
   */
  getIconClass() {
    return "cassandra-engine-icon";
  }

  /**
   * Connection settings are used to specify the fields needed to make the connection.
   * All the fields in this list will come later on future requests.
   * @return {ConnectionSettings}
   */
  getConnectionSettings() {
    return new ConnectionSettings({
      name: this.getName(),
      label: "Cassandra",
      custom: [
        new FieldConnection({id: 'hosts', title: "Host Names", tip:"Host names separated by comma"}),
        new FieldConnection({id: 'timeout', title: "Timeout", tip:"In seconds"}),

        new FieldConnection({id: 'datacenter', title: "Data Center", tip:"Default is: datacenter1"}),
        new FieldConnection({id: 'keyspace', title: "Keyspace", tip:"Optional"}),

        new FieldConnection({id: 'user', title: "User", tip: "optional"}),
        new FieldConnection({id: 'password', title: "Password", tip: "optional"}),
      ]
    });
  }

  /**
   * Called when the user requests to test the connection on the create connection window.
   *
   * @param  {object}   connectionCustomFields  A list of key:value objects containing the fields provided on getConnectionSettings
   * @param  {callable} onConnect               A callable used when the connection works
   * @param  {callable} onFail                  A callable used when the connection failed
   */
  testConnection(connectionCustomFields, onConnect, onFail) {
    let ccf = connectionCustomFields;

    if (ccf.hosts.length > 0 && ccf.datacenter.length > 0) {
      this._connect(ccf).then((client)=>{
        console.log(client)
        client.execute("SELECT * FROM system_schema.keyspaces;")
          .then(r=>onConnect("success"))
          .catch(e=>onFail(e.name + "\n" + e.info))
      });
    } else {
      onFail("Some necessary fields are not filled. Please check again");
    }
  }

  _connect(connectionFields) {
    // console.log(cassandra)
    // console.log(connectionFields)
    // TODO: manage multiple connections
    return new Promise((resolve) => {
      resolve(new cassandra.Client({
        contactPoints: connectionFields.hosts.split(',').map(e=>e.trim()),
        credentials: {username:connectionFields.user, password:connectionFields.password},
        localDataCenter: connectionFields.datacenter,
        keyspace: connectionFields.keyspace,
      }));
    });
  }

  /**
   * Resolve double clicks from dbex.
   * This methos is called when the user clicks any element under this engine settings.
   * @param  {string}   connectionName Reference for the user's connection
   * @param  {object}   datasets       A list of key:value objects containing the fields provided on getConnectionSettings
   * @param  {callable} onDone         A callable used when the processing is done. onDone must return one of the following: TreeItem, TreeItem[], ResultSet
   */
  resolveDoubleClick(connectionName, datasets, onDone) {
    console.log("resolveDoubleClick", datasets)
    let command = undefined;

    if (datasets.keyspace && datasets.keyspace.length > 0) {
      command = (connection)=>cluster.getTopics(connection, datasets.keyspace, onDone, this.logger);
    } else if (datasets.hosts && datasets.name) {
      command = (connection)=>cluster.getKeyspaces(connection, onDone, this.logger);
    } else if (datasets.tables) {
      command = (connection)=>table.getTables(connection, datasets.tables, onDone, this.logger);
    } else if (datasets.table) {
      command = (connection)=>table.getContent(connection, datasets.table, onDone, this.logger);
    } else if (datasets.types) {
      command = (connection)=>type.getTypes(connection, datasets.types, onDone, this.logger);
    } else if (datasets.functions) {
      command = (connection)=>func.getFunctions(connection, datasets.functions, onDone, this.logger);
    } else if (datasets.func) {
      command = (connection)=>func.describe(connection, datasets.func, onDone, this.logger);
    }

    // console.log(command)

    let connCreation = ()=>{
      this._connect(datasets).then((conn)=>{
        this.connections[connectionName] = conn;
        command(conn);
      }).catch(err=>{
        onDone(err || "Failed to connect");
        return;
      });
    };

    if (command) {
      this._executeOnConnection(
        connectionName,
        (connection)=>{
          command(connection);
        },
        (error)=>{
          if (error === CONNECTION_NOT_EXIST) {
            connCreation();
          } else {
            onDone(error);
          }
        }
      );
    } else {
      onDone();
    }
  }

  _executeOnConnection(connectionName, onSuccess, onError) {
    let conn = this.connections[connectionName] || undefined;

    if (conn) {
      onSuccess(conn);
    } else {
      onError(CONNECTION_NOT_EXIST);
    }
  }

  /**
   * triggered every time that an action on node is clicked
   * @param  {string}   action          The name given to the action (set on ItemAction)
   * @param  {string}   connectionName  Reference for the user's connection
   * @param  {object}   datasets        Node datasets to support the action
   * @param  {callable} onDone          A callable used when the processing is done. onDone must return one of the following: TreeItem, TreeItem[], ResultSet
   */
  resolveActionClick(action, connectionName, datasets, onDone) {
    console.log("TODO: resolveActionClick")
  }

  /**
   * @param {string}   uuid            Can be an empty string (when the user executes a query directly from the editor)
   * @param {string}   query           the query requested by the user
   * @param {string}   connectionName  Reference for the user's connection
   * @param {object}   datasets        Node datasets to support the action
   * @param {callable} onDone          A callable used when the processing is done. onDone must return one of the following: TreeItem, TreeItem[], ResultSet
   */
  executeQuery(uuid, query, connectionName, datasets, onDone) {
    this.logger.log(query);

    this.running[uuid] = query;

    let command = (connection)=>{
      connection.execute(query).then((results) => {
        if (results.columns) {
          onDone(table.prepareResultSet(results, query));
          return;
        }

        atom.notifications.addSuccess(
          this.getName() + "- Success!",
          {
            buttons: [],
            detail: "Query successfully executed",
            dismissable: false
          }
        );

        onDone(new ResultSet({recordsAffected: 0}))
      }).catch(response => {
        atom.notifications.addError(
          this.getName() + " - Failed to run query!",
          {
            buttons: [],
            detail: response.message,
            dismissable: true
          }
        );

        onDone();
        return;
      });
    };

    this._executeOnConnection(
      connectionName,
      (connection)=>{
        command(connection);
      },
      (error)=>{
        if (error === CONNECTION_NOT_EXIST) {
          console.log("TODO: connCreation")
          // connCreation();
        } else {
          onDone(error);
        }
      }
    );

  }

  /**
   * refresh node is a right-click option for every node. It is up to your implementation to decide if it will return something or not.
   * @param  {string}   connectionName  Reference for the user's connection
   * @param  {object}   datasets        Node datasets to support the refresh
   * @param  {callable} onDone          The onDone callback will just be processed if a TreeItem element is returned
   */
  refreshNode(connectionName, datasets, onDone) {
    console.log("TODO: refreshNode")
  }

  /**
   * If your database supports to stop ongoing queries, this method can be used to do it.
   * @param {string} uuid     a reference to the query's uuid send executeQuery method
   * @param {object} connData connection fields to support the action
   */
  stopQuery(uuid, connData) {
    console.log("TODO: stopQuery")
  }
}
