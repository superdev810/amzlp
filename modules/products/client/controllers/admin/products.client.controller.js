(function () {
  'use strict';

  angular
    .module('products.admin')
    .controller('ProductsAdminController', ProductsAdminController);

  ProductsAdminController.$inject = ['$scope', '$state', '$window', 'productResolve', 'Authentication', 'Notification'];

  function ProductsAdminController($scope, $state, $window, product, Authentication, Notification) {
    var vm = this;

    vm.product = product;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Product
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.product.$remove(function() {
          $state.go('admin.products.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Product deleted successfully!' });
        });
      }
    }

    // Save Product
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.productForm');
        return false;
      }

      // Create a new product, or update the current instance
      vm.product.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.products.list'); // should we send the User to the list or the updated Product's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Product saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Product save error!' });
      }
    }
  }
}());
