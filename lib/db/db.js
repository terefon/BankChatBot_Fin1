var sql = require("seriate");

var config = {
"server": "127.0.0.1",
"user": "sa",
"password": "Abcd123$",
"database": "Banking"
};

sql.setDefaultConfig(config);
exports.sqlDb = sql;