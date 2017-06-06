(function () {
  'use strict';

  angular
    .module('products.admin')
    .controller('ProductsAdminListController', ProductsAdminListController);

  ProductsAdminListController.$inject = ['ProductsService'];

  function ProductsAdminListController(ProductsService) {
    var vm = this;

    vm.products = ProductsService.query();
  }
}());
