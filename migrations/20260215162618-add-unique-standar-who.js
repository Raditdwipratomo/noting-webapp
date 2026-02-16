"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("standar_who", {
      fields: ["jenis_kelamin", "usia_bulan"],
      type: "unique",
      name: "uniq_standar_who_gender_age",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "standar_who",
      "uniq_standar_who_gender_age",
    );
  },
};
