(function () {
  'use strict';

  angular
    .module('products')
    .controller('ProductsController', ProductsController);

  ProductsController.$inject = ['$scope', 'productResolve', 'Authentication'];

  function ProductsController($scope, product, Authentication) {
    var vm = this;

    vm.product = product;
    vm.authentication = Authentication;

  }
}());
