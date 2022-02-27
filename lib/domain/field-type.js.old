'use babel';

import {TYPE} from '../dataModel/result-set';

/**
 * @see http://mysql-python.sourceforge.net/MySQLdb-1.2.2/public/MySQLdb.constants.FIELD_TYPE-module.html
 */
export default function fieldType(typeCode) {
  let number = [16, 0, 5, 247, 4, 9, 3, 8, 246, 11, 13];
  let text = [252, 255, 247, 251, 250, 254, 253, 15, 7];
  let boolean = [1];
  let date = [10, 12, 14];

  let result = TYPE.undefined;

  result = number.indexOf(typeCode) >= 0 ? TYPE.number : result;
  result = text.indexOf(typeCode) >= 0 ? TYPE.text : result;
  result = boolean.indexOf(typeCode) >= 0 ? TYPE.boolean : result;
  result = date.indexOf(typeCode) >= 0 ? TYPE.date : result;

  return result;
}
