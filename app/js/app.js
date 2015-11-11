(function () {

	var sirvDrag = angular.module('sirvDrag', []);

	sirvDrag.controller('MainCtrl', function ($scope) {

		$scope.items = [
			{ 
				name: 'Mike',
				path: 'pathToFile'
			},
			{ 
				name: 'Bob',
				path: 'pathToFile'
			},
			{ 
				name: 'Alex',
				path: 'pathToFile'
			},
			{ 
				name: 'John',
				path: 'pathToFile'
			},
			{ 
				name: 'Richard',
				path: 'pathToFile'
			}
		];

	});

	sirvDrag.directive('selectableArea', function ($document, $timeout) {
		return {
			restrict: 'A',
			controller: function ($scope, $element) {

				this.selectableItems = [];

				this.add = function (item) {
					this.selectableItems.push(item);
				};

				this.isIntersect = function (area, item) {
					return (item.start.x <= area.start.x && area.start.x <= item.end.x || area.start.x <= item.start.x && item.start.x <= area.end.x) && (item.start.y <= area.start.y && area.start.y <= item.end.y || area.start.y <= item.start.y && item.start.y <= area.end.y);
				};

				this.normalize = function (startPoint, endPoint) {
					var newStartPoint = {
						x: 0,
						y: 0
					};

					var newEndPoint = {
						x: 0,
						y: 0
					};

					if (startPoint.x > endPoint.x){
						newStartPoint.x = endPoint.x;
						newEndPoint.x = startPoint.x;
					} else{
						newStartPoint.x = startPoint.x;
						newEndPoint.x = endPoint.x;
					}

					if (startPoint.y > endPoint.y){
						newStartPoint.y = endPoint.y;
						newEndPoint.y = startPoint.y;
					} else{
						newStartPoint.y = startPoint.y;
						newEndPoint.y = endPoint.y;
					}

					return {
						start: newStartPoint,
						end: newEndPoint
					};

				};

			},
			link: function($scope, $element, $attrs, ctrl) {

				// global var for area
				var area,
					startPoint;

				function createSelectArea(area, startPoint, endPoint) {
					
					var normalizedPoints = ctrl.normalize(startPoint, endPoint);

					startPoint = normalizedPoints.start;
					endPoint = normalizedPoints.end;

					area.css({
					    "top": startPoint.y + "px",
					    "left": startPoint.x + "px",
					    "height": (endPoint.y - startPoint.y) + "px",
					    "width": (endPoint.x - startPoint.x) + "px"
					});

					return normalizedPoints;
				}

				function handleMouseDown (event) {
                    event.preventDefault();

					// add selected area div to body
					area = angular
					    .element("<div></div>")
					    .addClass('area');

					startPoint = {
						x: event.pageX,
						y: event.pageY
					};

					$document.find('body').append(area);

					$document.on('mousemove', handleMouseMove);
					$document.on('mouseup', handleMouseUp);
				}

				function handleMouseMove (event) {
                    event.preventDefault();

                    var endPoint = {
                    	x: event.pageX,
                    	y: event.pageY
                    };

                    // create selection area
                    var selectedArea = createSelectArea(area, startPoint, endPoint);

                    ctrl.selectableItems.forEach(function (item) {

                    	if ( ctrl.isIntersect(selectedArea, item.getBounds()) ){
                    		item.selecting();
                    		item.notSelected();
                    	} else{
                    		item.notSelecting();
                    	}

                    });

                   	$scope.$digest();

				}

				function handleMouseUp (event) {
                    event.preventDefault();

					// delete selected area
					area.remove();

                    ctrl.selectableItems.forEach(function (item) {

                    	if (item.isSelecting()){
                    		item.selected();
                    	} else{
                    		item.notSelected();
                    	}

					});

                   	$scope.$digest();

					$document.off('mousemove', handleMouseMove);
					$document.off('mouseup', handleMouseUp);
				}

				$document.on('mousedown', handleMouseDown);

			}
		};
	});

	sirvDrag.directive('selectableItem', function () {
		return {
			restrict: 'A',
			scope: true,
			require: '^selectableArea',
			link: function($scope, $element, $attrs, ctrl) {

				$scope.isSelecting = false;
				$scope.isSelected = false;

				var item = {
					element: $element,
					getBounds: function () {
						var bounds = this.element[0].getBoundingClientRect();
						return {
							start: {
								x: bounds.left,
								y: bounds.top
							},
							end: {
								x: bounds.right,
								y: bounds.bottom
							}
						};
					},
					selecting: function () {
						this.element.scope().isSelecting = true;
					},
					isSelecting: function () {
						return this.element.scope().isSelecting;
					},
					notSelecting: function () {
						this.element.scope().isSelecting = false;
					},
					selected: function () {
						this.element.scope().isSelected = true;
					},
					isSelected: function () {
						return this.element.scope().isSelected;
					},
					notSelected: function () {
						this.element.scope().isSelected = false;
					},
					getContext: function () {
						return this.element.scope().$parent().item;
					}
				};

				// add each item to upper ctrl
				ctrl.add(item);

			}
		};
	});

})();

