'use babel';

import TreeItem from '../dataModel/tree-item';
import ItemAction from '../dataModel/item-action';
import {Table as TableClass} from './table';

class View extends TableClass {
  get structType() {
    return 'View';
  }

  getViews(connection, database, onDone, logger, viewName) {
    let specificView = viewName ? ` AND T.TABLE_NAME = '${viewName}'` : '';
    let query = `
SELECT T.TABLE_TYPE, T.TABLE_SCHEMA, C.TABLE_NAME, C.COLUMN_NAME, C.ORDINAL_POSITION, C.DATA_TYPE, C.COLUMN_TYPE, C.COLUMN_KEY, C.COLUMN_COMMENT
  FROM INFORMATION_SCHEMA.COLUMNS C
LEFT JOIN INFORMATION_SCHEMA.TABLES T ON T.TABLE_NAME = C.TABLE_NAME
 WHERE C.TABLE_SCHEMA = '${database}' AND TABLE_TYPE = 'VIEW' ${specificView}
ORDER BY C.TABLE_SCHEMA, C.TABLE_NAME, FIELD(C.COLUMN_KEY, 'PRI', 'UNI', 'MUL', '') ASC, C.ORDINAL_POSITION
`;

    logger.log(query);

    connection.query(query).then((results) => {
      let views = [];
      let view = {label:undefined};

      results.forEach((record)=>{
        if (view.label !== record.TABLE_NAME) {
          if (view.name) {
            views.push(view);
          }

          view = new TreeItem({
            label: record.TABLE_NAME,
            name: record.TABLE_SCHEMA + "." + record.TABLE_NAME,
            icon: 'mariadb-view',
            children: [],
            details: "",
            collapsed: true,
            datasets: {
              singleSchema: record.TABLE_SCHEMA,
              singleName: record.TABLE_NAME,
              view: record.TABLE_SCHEMA + "." + record.TABLE_NAME,
            },
            actions: [
              new ItemAction({name:"structure", icon:"icon-struct", description:"Show structure"}),
            ]
          });
        }

        view.children.push(new TreeItem({
          label: record.COLUMN_NAME,
          name: record.TABLE_SCHEMA + "." + record.TABLE_NAME + "." + record.COLUMN_NAME,
          icon: record.COLUMN_KEY === "PRI" ? "icon-pk" : (record.COLUMN_KEY === "MUL" ? "icon-fk" : (record.COLUMN_KEY === "UNI" ? "icon-uk" : "icon-field")),
          details: record.COLUMN_TYPE,
          collapsed: true,
          datasets: {
            field: record.TABLE_SCHEMA + "." + record.TABLE_NAME + "." + record.COLUMN_NAME
          },
          actions: []
        }));
      });

      if (view.name) {
        views.push(view);
      }

      onDone(views);
    }).catch(err=>{
      onDone(err);
      return;
    });
  }

  getViewsNode(databaseName, views) {
    return new TreeItem({
      label: 'Views',
      name: databaseName + ".views",
      icon: 'mariadb-view',
      children: views,
      details: views.length,
      collapsed: true,
      datasets: {
        views: databaseName,
      },
      actions: []
    });
  }
}

export default new View();
