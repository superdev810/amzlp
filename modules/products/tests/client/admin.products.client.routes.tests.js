(function () {
  'use strict';

  describe('Products Route Tests', function () {
    // Initialize global variables
    var $scope,
      ProductsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ProductsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ProductsService = _ProductsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.products');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/products');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('admin.products.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/products/client/views/admin/list-products.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ProductsAdminController,
          mockProduct;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.products.create');
          $templateCache.put('/modules/products/client/views/admin/form-product.client.view.html', '');

          // Create mock product
          mockProduct = new ProductsService();

          // Initialize Controller
          ProductsAdminController = $controller('ProductsAdminController as vm', {
            $scope: $scope,
            productResolve: mockProduct
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.productResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/products/create');
        }));

        it('should attach an product to the controller scope', function () {
          expect($scope.vm.product._id).toBe(mockProduct._id);
          expect($scope.vm.product._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('/modules/products/client/views/admin/form-product.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ProductsAdminController,
          mockProduct;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.products.edit');
          $templateCache.put('/modules/products/client/views/admin/form-product.client.view.html', '');

          // Create mock product
          mockProduct = new ProductsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Product about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ProductsAdminController = $controller('ProductsAdminController as vm', {
            $scope: $scope,
            productResolve: mockProduct
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:productId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.productResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            productId: 1
          })).toEqual('/admin/products/1/edit');
        }));

        it('should attach an product to the controller scope', function () {
          expect($scope.vm.product._id).toBe(mockProduct._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('/modules/products/client/views/admin/form-product.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
