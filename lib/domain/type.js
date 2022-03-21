'use babel';

import TreeItem from '../dataModel/tree-item';
import {default as ResultSet} from '../dataModel/result-set';

export class Type {
  get structType() {
    return 'Type';
  }

  getTypes(connection, keyspaceName, onDone, logger, tableName) {
    let query = `SELECT * FROM system_schema.types WHERE keyspace_name='${keyspaceName}' order by type_name`;

    logger.log(query);

    connection.execute(query).then((results) => {
      let types = [];

      results.rows.forEach((record)=>{
        typeFields = [];

        record.field_names.forEach((field, i) => {
          typeField = new TreeItem({
            label: field,
            name: record.keyspace_name + "." + record.type_name + "." + field,
            icon: 'icon-field',
            children: [],
            details: record.field_types[i],
            collapsed: true,
            datasets: {},
          })

          typeFields.push(typeField )
        });

        typeEl = new TreeItem({
          label: record.type_name,
          name: record.keyspace_name + "." + record.type_name,
          icon: 'cassandra-type',
          children: typeFields,
          details: "",
          collapsed: true,
          datasets: {
            singleSchema: record.keyspace_name,
            singleName: record.type_name,
            type: record.keyspace_name + "." + record.type_name,
          },
        });

        types.push(typeEl)
      });

      onDone(types);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  getTypesNode(keyspaceName, types) {
    return new TreeItem({
      label: 'Types',
      name: keyspaceName + ".types",
      icon: 'cassandra-type',
      children: types,
      details: types.length,
      collapsed: true,
      datasets: {
        types: keyspaceName,
      },
      actions: []
    });
  }
}

export default new Type();
