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
          mainstate = $state.get('products');
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
          liststate = $state.get('products.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/products/client/views/list-products.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate,
          ProductsController,
          mockProduct;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('products.view');
          $templateCache.put('/modules/products/client/views/view-product.client.view.html', '');

          // create mock product
          mockProduct = new ProductsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Product about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ProductsController = $controller('ProductsController as vm', {
            $scope: $scope,
            productResolve: mockProduct
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:productId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.productResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            productId: 1
          })).toEqual('/products/1');
        }));

        it('should attach an product to the controller scope', function () {
          expect($scope.vm.product._id).toBe(mockProduct._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/products/client/views/view-product.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/products/client/views/list-products.client.view.html', '');

          $state.go('products.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('products/');
          $rootScope.$digest();

          expect($location.path()).toBe('/products');
          expect($state.current.templateUrl).toBe('/modules/products/client/views/list-products.client.view.html');
        }));
      });
    });
  });
}());
