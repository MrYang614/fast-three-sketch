# threeSketch

#### Description
旨在快速生成更易维护，易读性高的 three.js 项目。


#### Installation

1.  npm i fast-three-sketch

##### init

```
import { SketchBase } from "fast-three-sketch";

const sketch = new SketchBase( true, true );


sketch.initAxesHelper();

// render one frame
// sketch.render();

// render on animationFrame
sketch.animate();

// customRender for postprocessing
// sketch.customRender = Composer.render

// add components to the renderQueue 
// sketch.addUpdatable(updatableModule)

// remove components from the renderQueue
// sketch.removeUpdatable(updatableModule)

// saveScreenshot
// sketch.saveScreenshot("screenShot.png");

```

##### raycaster 
```
const raycasterControls = sketch.raycast( "click", group, intersections => {
    console.log( intersections);
} );

sketch.raycast( "dblclick", group, intersections => {
    console.log( intersections );
} );

setTimeout( () => {
    raycasterControls.clear();
}, 3000 );
```


#### Gitee Feature

1.  You can use Readme\_XXX.md to support different languages, such as Readme\_en.md, Readme\_zh.md
2.  Gitee blog [blog.gitee.com](https://gitee.com/yjsdszz/three-sketch)
3.  JueJin blog [juejin.com](https://juejin.cn/user/1834441468557735)
