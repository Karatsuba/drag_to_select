(function () {

	var sirvDrag = angular.module('sirvDrag', []);

	sirvDrag.controller('MainCtrl', function ($scope) {

		$scope.items = _.range(10).map(function (item) {
			return { 
				name: 'Mike',
				path: 'pathToFile'
			};
		});

		this.select = function (items) {
			console.log(items);
		};

	});

	sirvDrag.directive('selectableArea', function ($document, $timeout) {
		return {
			restrict: 'A',
            controllerAs: 'area',
			controller: function ($scope, $element, $attrs) {

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

					var bounds = area[0].getBoundingClientRect();

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
                    	} else{
                    		item.notSelecting();
                    	}

                    });

                   	$scope.$digest();

				}

				function handleMouseUp (event) {
                    event.preventDefault();

					var items = ctrl.selectableItems.filter(function (item) {
						return item.isSelected();
					}).map(function (item) {
						return item.getContext();
					});

					$scope.$eval($attrs.onSelected, {$items: items});

					// delete selected area
					area.remove();

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
			require: '^selectableArea',
			link: function($scope, $element, $attrs, ctrl) {

				var item = {
					getBounds: function () {
						var bounds = $element[0].getBoundingClientRect();
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
						$element.addClass('selecting');
					},
					isSelected: function () {
						return $element.hasClass('selecting');
					},
					notSelecting: function () {
						$element.removeClass('selecting');
					},
					getContext: function () {
						return $scope.$eval($attrs.selectableItem);
					}
				};

				// add each item to upper ctrl
				ctrl.add(item);

			}
		};
	});

})();

