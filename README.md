[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://bitbucket.org/lbesson/ansi-colors)
[![Generic badge](https://img.shields.io/badge/Status-Early_BETA-red.svg)](https://shields.io/)
[![GPLv3 license](https://img.shields.io/badge/License-GPLv3-blue.svg)](http://perso.crans.org/besson/LICENSE.html)
[![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](https://GitHub.com/Naereen/ama)

# atom-dbex-cassandra
[Dbex](https://github.com/marcelkohl/dbex) Cassandra engine for Atom Editor.

STILL IN BETA, NOT USABLE

## TODO

- List types, functions
- Query on Cassandra with results
- Multiple connections to different sources

## Copyrights
[Eye Icon](https://www.svgrepo.com/svg/53299/eye) from [SVGrepo](https://www.svgrepo.com/)

## References
https://www.npmjs.com/package/cassandra-driver
https://docs.datastax.com/en/developer/nodejs-driver/4.6/

<!-- This engine supports most of the basic aspects of a Cassandra connection including:

- Listing schemas, tables, views, functions, procedures and table triggers
- Distintion about Primary/Foreign keys, and normal fields;
- Double click on Table and Views shows a limited query;
- Actions to show structures for tables, views, functions, procedures and table triggers; -->

<!-- ![Dbex MariaDB engine for Atom Editor](https://raw.githubusercontent.com/marcelkohl/atom-dbex-mariadb/master/samples/atom-mariadb-engine.png) -->

<!-- ## TODO
- cover "DELIMITER" on queries;
- multiple lines are not working
    - example:  `SET FOREIGN_KEY_CHECKS=0;
    UPDATE `store` SET store_id = 0 WHERE code='admin';
    UPDATE `store_group` SET group_id = 0 WHERE name='Default';
    UPDATE `store_website` SET website_id = 0 WHERE code='admin';
    UPDATE `customer_group` SET customer_group_id = 0 WHERE customer_group_code='NOT LOGGED IN';
    SET FOREIGN_KEY_CHECKS=1;`
- implement ssl connection
- export/import data/structure (dump/restore) -->
