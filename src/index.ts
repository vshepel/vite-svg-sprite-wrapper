import FastGlob from 'fast-glob';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import colors from 'picocolors';
import picomatch from 'picomatch';
import SVGSpriter from 'svg-sprite';
import { normalizePath, type PluginOption, type ResolvedConfig, type ViteDevServer } from 'vite';

export interface Options {
  /**
   * Input directory
   *
   * @default 'src/assets/images/svg/*.svg'
   */
  icons?: string;
  /**
   * Output directory
   *
   * @default 'src/public/images'
   */
  outputDir?: string;

  /**
   * sprite-svg {@link https://github.com/svg-sprite/svg-sprite/blob/main/docs/configuration.md#sprite-svg-options|options}
   */
  sprite?: SVGSpriter.Config;

  /**
   * Parameters to generate the types
   * @default null
   */
  types?: {
    /** full path to the typescript file */
    path: string;
    /** name of the type itself
     * (e.g. SpriteSvg for `const svg: SpriteSvg`) */
    typeName: string;
  };
}

const root = process.cwd();
const isSvg = /\.svg$/;

function normalizePaths(root: string, path: string | undefined): string[] {
  return (Array.isArray(path) ? path : [path]).map((path) => resolve(root, path)).map(normalizePath);
}

function generateConfig(outputDir: string, spriteOptions: Options['sprite']) {
  return {
    dest: normalizePath(resolve(root, outputDir)),
    mode: {
      symbol: {
        sprite: '../sprite.svg',
      },
    },
    svg: {
      xmlDeclaration: false,
    },
    shape: {
      transform: [
        {
          svgo: {
            plugins: [
              { name: 'preset-default' },
              {
                name: 'removeAttrs',
                params: {
                  attrs: ['*:(data-*|style|fill):*'],
                },
              },
              {
                name: 'addAttributesToSVGElement',
                params: {
                  attributes: [{ fill: 'currentColor' }],
                },
              },
              'removeXMLNS',
            ],
          },
        },
      ],
    },
    ...spriteOptions,
  };
}

async function generateSvgSprite({ sprite, outputDir, icons, types }: Options): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const spriter = new SVGSpriter(generateConfig(outputDir, sprite));
  const rootDir = icons.replace(/(\/(\*+))+\.(.+)/g, '');
  const entries = await FastGlob([icons]);

  for (const entry of entries) {
    if (isSvg.test(entry)) {
      const relativePath = entry.replace(`${rootDir}/`, '');
      spriter.add(entry, relativePath, readFileSync(entry, { encoding: 'utf-8' }));
    }
  }

  const { result, data } = await spriter.compileAsync();

  if (types != null) {
    const shapeIds = data.symbol.shapes.map(({ base }) => {
      return `'${base}'`;
    });
    const typeString = `type ${types.typeName} = ${shapeIds.join(' | ')}`;

    writeFileSync(types.path, typeString);
  }

  writeFileSync(result.symbol.sprite.path, result.symbol.sprite.contents.toString('utf8'));

  return result.symbol.sprite.path.replace(`${root}/`, '');
}

function ViteSvgSpriteWrapper(options: Options = {}): PluginOption {
  const { icons = 'src/assets/images/svg/*.svg', outputDir = 'src/public/images', types = null } = options;
  let timer: number | undefined;
  let config: ResolvedConfig;

  function clear() {
    clearTimeout(timer);
  }

  function schedule(fn: () => void) {
    clear();
    timer = setTimeout(fn, 200) as any as number;
  }

  const formatConsole = (msg: string) => `${colors.cyan('[vite-plugin-svg-sprite]')} ${msg}`;

  return [
    {
      name: 'vite-plugin-svg-sprite:build',
      apply: 'build',
      configResolved(_config) {
        config = _config;
      },
      writeBundle: {
        sequential: true,
        async handler() {
          generateSvgSprite(options)
              .then((res) => {
                config.logger.info(formatConsole(`Sprite generated ${colors.green(res)}`));
              })
              .catch((err) => {
                config.logger.info(
                    formatConsole(`${colors.red('Sprite error')} ${colors.dim(err as any)}`)
                );
              });
        },
      },
    },
    {
      name: 'vite-plugin-svg-sprite:serve',
      apply: 'serve',
      configResolved(_config) {
        config = _config;
      },
      buildStart: {
        sequential: true,
        async handler() {
          generateSvgSprite(options)
              .then((res) => {
                config.logger.info(formatConsole(`${colors.green('sprite generated')} ${colors.dim(res)}`));
              })
              .catch((err) => {
                config.logger.info(formatConsole(`${colors.red('sprite error')} ${colors.dim(err)}`));
              });
        },
      },
      config: () => ({ server: { watch: { disableGlobbing: false } } }),
      configureServer({ watcher, ws, config: { logger } }: ViteDevServer) {
        const iconsPath = normalizePaths(root, icons);
        const shouldReload = picomatch(iconsPath);
        const checkReload = (path: string) => {
          if (shouldReload(path)) {
            schedule(() => {
              generateSvgSprite(options)
                  .then((res) => {
                    ws.send({ type: 'full-reload', path: '*' });
                    logger.info(formatConsole(`${colors.green('sprite changed')} ${colors.dim(res)}`));
                  })
                  .catch((err) => {
                    logger.info(formatConsole(`${colors.red('sprite error')} ${colors.dim(err)}`));
                  });
            });
          }
        };

        watcher.add(iconsPath);
        watcher.on('add', checkReload);
        watcher.on('change', checkReload);
        watcher.on('unlink', checkReload);
      },
    },
  ];
}

export default ViteSvgSpriteWrapper;
