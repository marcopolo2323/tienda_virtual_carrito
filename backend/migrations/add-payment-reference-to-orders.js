'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'payment_reference', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'payment_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'payment_reference');
  }
};
