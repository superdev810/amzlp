(function () {
  'use strict';

  angular
    .module('products')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Products',
      state: 'products',
      type: 'dropdown',
      roles: ['user']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'products', {
      title: 'List Porducts',
      state: 'products.list',
      roles: ['user']
    });
  }
}());
