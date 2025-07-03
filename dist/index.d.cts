import SVGSpriter from 'svg-sprite';
import { PluginOption } from 'vite';

interface Options {
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
     * Defines if the svg's fill should be normalized to currentColor
     *
     * @default true
     */
    spriteNormalizeFill?: boolean;
    /**
     * Defines if the svg's stroke should be normalized to currentColor
     *
     * @default false
     */
    spriteNormalizeStroke?: boolean;
    /**
     * Defines if a type should be generated
     * @default false
     */
    generateType?: boolean;
    /**
     * Name of the type to be used when generateType is set to true
     * @default 'SvgIcons'
     */
    typeName?: string;
    /**
     * File name of the generated type file
     * @default 'svg-icons'
     */
    typeFileName?: string;
    /**
     * Name of the output directory for generated type file
     * @default '{@link icons} directory'
     */
    typeOutputDir?: string;
}
declare const defaultOptions: Required<Options>;
declare function resolveOptions(options: Options): Required<Options> & Options;
declare function ViteSvgSpriteWrapper(options?: Options): PluginOption;

export { type Options, ViteSvgSpriteWrapper as default, defaultOptions, resolveOptions };
