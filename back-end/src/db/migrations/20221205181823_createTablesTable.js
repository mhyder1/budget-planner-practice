
exports.up = function (knex) {
    return knex.schema.createTable("tables", (table) => {
      table.increments("table_id").primary();
      table.string('table_name', 255);
      table.integer('capacity');
      table.timestamps(true, true);
    });
  };
  
exports.down = function (knex) {
  return knex.schema.dropTable("tables");
};