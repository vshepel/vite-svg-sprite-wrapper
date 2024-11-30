# vite-svg-sprite-wrapper

<p>
  <a href="https://npmjs.com/package/vite-svg-sprite-wrapper"><img src="https://img.shields.io/npm/v/vite-svg-sprite-wrapper.svg" alt="npm package"></a>
</p>

> [svg-sprite](https://github.com/svg-sprite/svg-sprite/) wrapper for [Vite](https://github.com/vitejs/vite)

## Install

```
npm i vite-svg-sprite-wrapper -D
```

## Usage

Add it to your plugins in `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import ViteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';

export default defineConfig({
  plugins: [
    ViteSvgSpriteWrapper({
      /**
       * Input directory
       *
       * @default 'src/assets/images/svg/*.svg'
       */
      icons?: string
      /**
       * Output directory
       *
       * @default 'src/public/images'
       */
      outputDir?: string

      /**
       * sprite-svg {@link https://github.com/svg-sprite/svg-sprite/blob/main/docs/configuration.md#sprite-svg-options|options}
       */
      sprite?: SVGSpriter.Config
      /**
       * Defines if a type should be generated
       * @default false
       */
      generateType?: boolean
      /**
       * Name of the type to be used when generateType is set to true
       * @default 'SvgIcons'
       */
      typeName?: string
      /**
       * File name of the generated type file
       * @default 'svg-icons'
       */
      typeFileName?: string
      /**
       * Name of the output directory for generated type file
       * @default '{@link icons} directory'
       */
      typeOutputDir?: string
    }),
  ],
})
```

Now, any changes to the .svg files in the `icons` folder will generate a `sprite.svg` in the `outputDir` folder.

So you can use the icons somehow ([Example](https://github.com/vshepel/vite-svg-sprite-wrapper/tree/master/example)):

```html
<svg class="icon" aria-hidden="true">
  <use xlink:href="/images/sprite.svg#star"></use>
</svg>
```

### Example of React Component:

Config:

```ts
ViteSvgSpriteWrapper({
  outputDir: 'public',
  generateType: true,
  typeName: 'IIcon',
  typeFileName: 'Icon',
  typeOutputDir: './src/type',
})
```

Component:

```tsx
import type { IIcon } from './src/type/Icon'

import sprite from '/sprite.svg'

interface Props {
  icon: IIcon
}

function Icon({ icon }: Props) {
  return (
    <svg className="icon" aria-hidden="true">
      <use xlinkHref={`${sprite}#${icon}`}></use>
    </svg>
  )
}

export default Icon
```

MIT License © 2024 [Volodymyr Shepel](https://github.com/vshepel)
