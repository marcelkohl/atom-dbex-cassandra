'use babel';

import {TYPE} from '../dataModel/result-set';

/**
 * @see https://cassandra.apache.org/doc/latest/cassandra/cql/types.html
 * @see https://github.com/datastax/nodejs-driver/blob/388418dd7d9cf7c0e1e8a803a7791458268c9ad6/lib/types/index.js
 */
export default function fieldType(typeCode) {
  let number = [1, 2, 3, 5, 6, 7, 8, 9, 19, 20];
  let text = [10, 12, 13, 14, 15, 16, 18, 32, 34, 49];
  let boolean = [4];
  let date = [11, 17];

  let result = TYPE.undefined;

  result = number.indexOf(typeCode) >= 0 ? TYPE.number : result;
  result = text.indexOf(typeCode) >= 0 ? TYPE.text : result;
  result = boolean.indexOf(typeCode) >= 0 ? TYPE.boolean : result;
  result = date.indexOf(typeCode) >= 0 ? TYPE.date : result;

  return result;
}

export const TYPE_DESCRIPTION = {
  0:'custom',
  1:'ascii',
  2:'bigint',
  3:'blob',
  4:'boolean',
  5:'counter',
  6:'decimal',
  7:'double',
  8:'float',
  9:'int',
  10:'text',
  11:'timestamp',
  12:'uuid',
  13:'varchar',
  14:'varint',
  15:'timeuuid',
  16:'inet',
  17:'date',
  18:'time',
  19:'smallint',
  20:'tinyint',
  32:'list',
  33:'map',
  34:'set',
  48:'udt',
  49:'tuple',
}
