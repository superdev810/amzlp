(function () {
  'use strict';

  angular
    .module('products.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.products', {
        abstract: true,
        url: '/products',
        template: '<ui-view/>'
      })
      .state('admin.products.list', {
        url: '',
        templateUrl: '/modules/products/client/views/admin/list-products.client.view.html',
        controller: 'ProductsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.products.create', {
        url: '/create',
        templateUrl: '/modules/products/client/views/admin/form-product.client.view.html',
        controller: 'ProductsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          productResolve: newProduct
        }
      })
      .state('admin.products.edit', {
        url: '/:productId/edit',
        templateUrl: '/modules/products/client/views/admin/form-product.client.view.html',
        controller: 'ProductsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          productResolve: getProduct
        }
      });
  }

  getProduct.$inject = ['$stateParams', 'ProductsService'];

  function getProduct($stateParams, ProductsService) {
    return ProductsService.get({
      productId: $stateParams.productId
    }).$promise;
  }

  newProduct.$inject = ['ProductsService'];

  function newProduct(ProductsService) {
    return new ProductsService();
  }
}());
