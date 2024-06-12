class Node {
	constructor(obj, dimension, parent = null) {
		this.obj = obj;
		this.left = null;
		this.right = null;
		this.parent = parent;
		this.dimension = dimension;
	}
}

function quickSelect(arr, k, left, right, compare) {
	quickSelectStep(arr, k, left || 0, right || arr.length - 1, compare || defaultCompare);
}

function quickSelectStep(arr, k, left, right, compare) {
	while (right > left) {
		if (right - left > 600) {
			var n = right - left + 1;
			var m = k - left + 1;
			var z = Math.log(n);
			var s = 0.5 * Math.exp((2 * z) / 3);
			var sd = 0.5 * Math.sqrt((z * s * (n - s)) / n) * (m - n / 2 < 0 ? -1 : 1);
			var newLeft = Math.max(left, Math.floor(k - (m * s) / n + sd));
			var newRight = Math.min(right, Math.floor(k + ((n - m) * s) / n + sd));
			quickSelectStep(arr, k, newLeft, newRight, compare);
		}

		var t = arr[k];
		var i = left;
		var j = right;

		swap(arr, left, k);
		if (compare(arr[right], t) > 0) swap(arr, left, right);

		while (i < j) {
			swap(arr, i, j);
			i++;
			j--;
			while (compare(arr[i], t) < 0) i++;
			while (compare(arr[j], t) > 0) j--;
		}

		if (compare(arr[left], t) === 0) swap(arr, left, j);
		else {
			j++;
			swap(arr, j, right);
		}

		if (j <= k) left = j + 1;
		if (k <= j) right = j - 1;
	}
}

function swap(arr, i, j) {
	var tmp = arr[i];
	arr[i] = arr[j];
	arr[j] = tmp;
}

function defaultCompare(a, b) {
	return a < b ? -1 : a > b ? 1 : 0;
}

/**更快速、更简易kdTree，去除了最小堆，保留了基础搜索，优化了排序算法。 */
export class SimpleKDTree {
	/**
	 * @template T
	 * @param {T[]} points 需要进行大量计算的数据集合 []
	 * @param {(a:T,b:T)=>number} metric 权重计算函数  例如 ： (a,b)=>{ return a.x+b.x }
	 * @param {[keyof T]} dimensions 维度数组  例如 ： [ "x","y" ] |  ["x","z"]
	 */
	constructor(points, metric, dimensions) {
		this.dimensions = dimensions;
		this.points = points;
		this.metric = metric;

		function buildTree(points, depth, parent) {
			const dim = depth % dimensions.length;
			let median, node;

			if (points.length === 0) {
				return null;
			}
			if (points.length === 1) {
				return new Node(points[0], dim, parent);
			}

			median = Math.floor(points.length / 2);

			quickSelect(points, median, 0, points.length - 1, (a, b) =>
				a[dimensions[dim]] < b[dimensions[dim]] ? -1 : a[dimensions[dim]] > b[dimensions[dim]] ? 1 : 0,
			);
			// points.sort(function (a, b) {
			// 	return a[dimensions[dim]] - b[dimensions[dim]];
			// });

			node = new Node(points[median], dim, parent);
			node.left = buildTree(points.slice(0, median), depth + 1, node);
			node.right = buildTree(points.slice(median + 1), depth + 1, node);

			return node;
		}

		this.root = buildTree(points, 0, null);
	}

	/**
	 * 最近邻查找
	 * @template T
	 * @param {T} point 以 point 为目标
	 * @param {number} maxDistance 以 point 为目标，经过 metric 权重计算函数，距离 point 在 maxDistance 以内的所有数据
	 * @returns {[T,distance][]} 返回二维数组，T 为数据，distance 为当前数据距离 point 的距离
	 */
	nearest(point, maxDistance) {
		const scope = this;

		let result = [];

		function saveNode(node, distance) {
			result.push([node, distance]);
		}

		function nearestSearch(node) {
			const dimension = scope.dimensions[node.dimension];
			const ownDistance = scope.metric(point, node.obj);
			const linearPoint = {};

			let bestChild, linearDistance, otherChild;

			for (let i = 0; i < scope.dimensions.length; i += 1) {
				if (i === node.dimension) {
					linearPoint[scope.dimensions[i]] = point[scope.dimensions[i]];
				} else {
					linearPoint[scope.dimensions[i]] = node.obj[scope.dimensions[i]];
				}
			}

			linearDistance = scope.metric(linearPoint, node.obj);

			if (node.right === null && node.left === null) {
				if (ownDistance <= maxDistance) {
					saveNode(node, ownDistance);
				}
				return;
			}

			if (node.right === null) {
				bestChild = node.left;
			} else if (node.left === null) {
				bestChild = node.right;
			} else {
				if (point[dimension] < node.obj[dimension]) {
					bestChild = node.left;
				} else {
					bestChild = node.right;
				}
			}

			nearestSearch(bestChild);

			if (ownDistance <= maxDistance) {
				saveNode(node, ownDistance);
			}

			if (Math.abs(linearDistance) < maxDistance) {
				if (bestChild === node.left) {
					otherChild = node.right;
				} else {
					otherChild = node.left;
				}
				if (otherChild !== null) {
					nearestSearch(otherChild);
				}
			}
		}

		if (scope.root) nearestSearch(scope.root);

		return result;
	}
	remove(point) {
		const scope = this;
		let node;

		function nodeSearch(node) {
			if (node === null) {
				return null;
			}

			if (node.obj === point) {
				return node;
			}

			var dimension = scope.dimensions[node.dimension];

			if (point[dimension] < node.obj[dimension]) {
				return nodeSearch(node.left);
			} else {
				return nodeSearch(node.right);
			}
		}

		function removeNode(node) {
			let nextNode, nextObj, pDimension;

			function findMin(node, dim) {
				let dimension, own, left, right, min;

				if (node === null) {
					return null;
				}

				dimension = scope.dimensions[dim];

				if (node.dimension === dim) {
					if (node.left !== null) {
						return findMin(node.left, dim);
					}
					return node;
				}

				own = node.obj[dimension];
				left = findMin(node.left, dim);
				right = findMin(node.right, dim);
				min = node;

				if (left !== null && left.obj[dimension] < own) {
					min = left;
				}
				if (right !== null && right.obj[dimension] < min.obj[dimension]) {
					min = right;
				}
				return min;
			}

			if (node.left === null && node.right === null) {
				if (node.parent === null) {
					scope.root = null;
					return;
				}

				pDimension = this.dimensions[node.parent.dimension];

				if (node.obj[pDimension] < node.parent.obj[pDimension]) {
					node.parent.left = null;
				} else {
					node.parent.right = null;
				}
				return;
			}

			// 如果右子树不为空，使用节点维度上最小的元素进行替换，如果为空，交换左右子树，做同样的操作，保证节点再移除之后，原有树的顺序依旧保持
			if (node.right !== null) {
				nextNode = findMin(node.right, node.dimension);
				nextObj = nextNode.obj;
				removeNode(nextNode);
				node.obj = nextObj;
			} else {
				nextNode = findMin(node.left, node.dimension);
				nextObj = nextNode.obj;
				removeNode(nextNode);
				node.right = node.left;
				node.left = null;
				node.obj = nextObj;
			}
		}

		node = nodeSearch(scope.root);

		if (node === null) {
			return;
		}

		removeNode(node);
	}
	balanceFactor() {
		function height(node) {
			if (node === null) {
				return 0;
			}
			return Math.max(height(node.left), height(node.right)) + 1;
		}

		function count(node) {
			if (node === null) {
				return 0;
			}
			return count(node.left) + count(node.right) + 1;
		}

		return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
	}
	insert(point) {
		const scope = this;
		function innerSearch(node, parent) {
			if (node === null) {
				return parent;
			}

			const dimension = scope.dimensions[node.dimension];
			if (point[dimension] < node.obj[dimension]) {
				return innerSearch(node.left, node);
			} else {
				return innerSearch(node.right, node);
			}
		}

		const insertPosition = innerSearch(this.root, null);
		let newNode, dimension;

		if (insertPosition === null) {
			this.root = new Node(point, null, null);
			return;
		}

		newNode = new Node(point, (insertPosition.dimension + 1) % this.dimensions.length, insertPosition);
		dimension = this.dimensions[insertPosition.dimension];

		if (point[dimension] < insertPosition.obj[dimension]) {
			insertPosition.left = newNode;
		} else {
			insertPosition.right = newNode;
		}
	}
}

