"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TABLE standar_who MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TABLE standar_who MODIFY COLUMN id INT NOT NULL;"
    );
  },
};
