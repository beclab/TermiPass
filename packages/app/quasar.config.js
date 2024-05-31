/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const { configure } = require('quasar/wrappers');
const { notarize } = require('@electron/notarize');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const macConfig = require('./build/electron/mac/buildConfig');
const winConfig = require('./build/electron/win/buildConfig');

const extensionPlaceholder = 'webos_app_plugin_id';

module.exports = configure(function (ctx) {
	return {
		// https://v2.quasar.dev/quasar-cli-webpack/supporting-ts
		supportTS: {
			tsCheckerConfig: {
				eslint: {
					enabled: true,
					files: './src/**/*.{ts,tsx,js,jsx,vue}'
				}
			}
		},

		// https://v2.quasar.dev/quasar-cli-webpack/prefetch-feature
		preFetch: true,

		// app boot file (/src/boot)
		// --> boot files are part of "main.js"
		// https://v2.quasar.dev/quasar-cli-webpack/boot-files
		boot: [
			'i18n',
			'smartEnginEntrance',
			'axios',
			ctx.mode.bex ? 'bexConfig' : ''

			// 'iconfont.js'
		],

		// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-css
		css: [
			'app.scss',
			!ctx.dev && ['FILES', 'WEB'].includes(process.env.PLATFORM)
				? 'font.pro.scss'
				: 'font.dev.scss'
		],

		// https://github.com/quasarframework/quasar/tree/dev/extras
		extras: ['material-icons', 'bootstrap-icons'],

		vendor: {
			remove: ['moment', '@bytetrade/ui', 'video.js']
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-build
		build: {
			vueRouterMode: 'history', // available values: 'hash', 'history'

			env: {
				PL_SERVER_URL: process.env.PL_SERVER_URL,
				PLATFORM: process.env.PLATFORM,
				BFL_URL: process.env.URL,
				IS_PC_TEST: process.env.IS_PC_TEST,
				WS_URL: process.env.WS_URL,
				IS_BEX: process.env.PLATFORM == 'BEX',
				CACHE_CONTROL: 'max-age=31536000, public',
				EXPIRES: 'Wed, 01 Jan 2025 00:00:00 GMT'
			},

			// transpile: false,

			// Add dependencies for transpiling with Babel (Array of string/regex)
			// (from node_modules, which are by default not transpiled).
			// Applies only if "transpile" is set to true.
			// transpileDependencies: [],

			// rtl: true, // https://quasar.dev/options/rtl-support
			// preloadChunks: true,
			// showProgress: false,
			gzip: true,
			// analyze: true,
			extractCSS: true,
			sourceMap: true,

			// Options below are automatically set depending on the env, set them if you want to override
			// extractCSS: false,
			extendWebpack(cfg) {
				cfg.resolve.fallback = {
					fs: false,
					tls: false,
					net: false
				};

				const isBex = ctx.modeName === 'bex';

				if (!ctx.dev && isBex) {
					if (cfg.entry.app) {
						const customEntryPath = './.quasar/client-entry-bex.js';
						const qusarEntryPath = './.quasar/client-entry.js';
						const quasarAppPath = './.quasar/app.js';
						const appBexFileName = 'app-bex.js';
						const customAppPath = `./.quasar/${appBexFileName}`;
						changeQuasarFile(quasarAppPath, customAppPath, (content) =>
							content.replace(
								'app/src/router/index',
								'app/src/router/index-bex'
							)
						);

						changeQuasarFile(qusarEntryPath, customEntryPath, (content) =>
							content
								.replace('#q-app', '#terminus-app-root')
								.replace('app.js', appBexFileName)
								.replace(
									"import 'quasar/dist/quasar.sass'",
									"(() => import('quasar/dist/quasar.sass'))()"
								)
						);

						const clientEntry = path.resolve(__dirname, customEntryPath);
						cfg.entry.app = clientEntry;
					}

					cfg.module.rules.push({
						test: /wallet-core\.js$/,
						use: [
							{
								loader: 'string-replace-loader',
								options: {
									search: 'fetch\\(G,',
									replace: `fetch(globalThis.extensionPlaceholder ? '/www/wallet-core.wasm' : 'chrome-extension://'+globalThis.${extensionPlaceholder}+'/www/wallet-core.wasm',`,
									flags: 'g'
								}
							}
						]
					});
				}
			},

			// https://v2.quasar.dev/quasar-cli-webpack/handling-webpack
			// "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
			chainWebpack(chain, { isClient }) {
				const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
				chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin);

				const CopyWebpackPlugin = require('./build/plugins/CopyFilePlugin');
				let wasmRoot = `./dist/${ctx.modeName}/`;
				const isBex = ctx.modeName === 'bex';
				const isMobile = ctx.modeName === 'capacitor';
				const isElectron = ctx.modeName === 'electron';

				if (!ctx.dev) {
					if (isMobile || isBex || isElectron) {
						const updatePackageVersionByLatestTag = require('./build/plugins/UpdatePackageVersionByLatestTag');

						let updateJsonFile = [];
						if (isBex) {
							updateJsonFile = ['src-bex/manifest.json'];
						}
						chain
							.plugin('update-package-json')
							.use(updatePackageVersionByLatestTag, [updateJsonFile]);
					}

					if (isMobile) {
						const CapacitorUpdateVersionCode = require('./build/plugins/CapacitorUpdateVersionCode');
						chain
							.plugin('update-capacitor-package-json')
							.use(CapacitorUpdateVersionCode);
					}

					if (isMobile) {
						wasmRoot = './src-capacitor/www/';
					}

					if (isElectron) {
						wasmRoot = `./dist/${ctx.modeName}/` + 'UnPackaged/';
					}

					const copyFileArray = [];

					if (isElectron) {
						copyFileArray.push({
							fromPath: path.resolve('./src-electron/files/'),
							fromName: 'filesAsync.js',
							toPath: path.resolve(wasmRoot),
							toName: 'filesAsync.js'
						});
						const isMac = ctx.targetName === 'mac';
						const isWin = ctx.targetName === 'win';
						if (isMac) {
							copyFileArray.push({
								fromPath: path.resolve('./desktopAddon/mac/'),
								fromName: 'DesktopAddon.node',
								toPath: path.resolve(wasmRoot),
								toName: 'DesktopAddon.node'
							});
						} else if (isWin) {
							copyFileArray.push({
								fromPath: path.resolve('./desktopAddon/win/'),
								fromName: 'DesktopAddon.node',
								toPath: path.resolve(wasmRoot),
								toName: 'DesktopAddon.node'
							});
							copyFileArray.push({
								fromPath: path.resolve('./src-electron/'),
								fromName: 'tailscale.js',
								toPath: path.resolve(wasmRoot),
								toName: 'tailscale.js'
							});
							copyFileArray.push({
								fromPath: path.resolve('./src-electron/'),
								fromName: 'networkMonitor.js',
								toPath: path.resolve(wasmRoot),
								toName: 'networkMonitor.js'
							});
						}
					}

					if (isBex) {
						chain.output.filename('js/[name].js');

						chain.module
							.rule('images')
							.use('url-loader')
							.loader('url-loader')
							.tap((options) => {
								options.limit = 100 * 1024 * 1024;
								return options;
							});

						chain.resolve.alias.set(
							'vue-i18n$',
							'vue-i18n/dist/' + 'vue-i18n.runtime.esm-bundler.js'
						);

						chain.plugin('define').tap((definitions) => {
							Object.assign(definitions[0], {
								// ... rest of your injected vars here
								// get rid of vue-i18 warning
								__VUE_I18N_FULL_INSTALL__: JSON.stringify(true),
								__INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
								__VUE_I18N_LEGACY_API__: JSON.stringify(false)
							});
							return definitions;
						});

						chain
							.entry('TermiPassProvider')
							.add(
								'src/extension/provider/content-script/provider/termiPassProvider.ts'
							)
							.end();

						chain
							.entry('rssContentScript')
							.add('src/extension/rss/content-script/index.js')
							.end();

						chain
							.entry('sidePanelContentScript')
							.add('src/extension/sidePanel/content-script/index.js');

						const quasarManifestV3Plugin = require('./build/plugins/QuasarManifestV3Plugin');
						chain.plugin('quasar-manifest-v3').use(quasarManifestV3Plugin, []);
						chain.plugins.delete('webpack-bex-packager');

						const BexPackager = require('./build/plugins/QuasarBexPackager');
						chain
							.plugin('webpack-bex-packager-new')
							.after('quasar-manifest-v3')
							.use(BexPackager, [
								{
									src: path.join(path.join('dist', ctx.modeName), 'UnPackaged'),
									dest: path.join(path.join('dist', ctx.modeName), 'Packaged'),
									name: 'vault'
								}
							])
							.end();

						chain.optimization.splitChunks({
							cacheGroups: {
								'webextension-polyfill': {
									minSize: 0,
									test: /[\\/]node_modules[\\/]webextension-polyfill/,
									name: 'webextension-polyfill',
									chunks: 'all'
								}
							}
						});

						wasmRoot = `./dist/${ctx.modeName}/` + 'UnPackaged/www/';

						copyFileArray.push({
							fromPath: path.resolve('./src/extension/autofill/layout/'),
							fromName: 'autofill.js',
							toPath: path.resolve(wasmRoot + 'js/'),
							toName: 'autofill.js'
						});

						copyFileArray.push({
							fromPath: path.resolve('./src/extension/autofill/layout/'),
							fromName: 'autofill.css',
							toPath: path.resolve(wasmRoot + 'css/'),
							toName: 'autofill.css'
						});

						copyFileArray.push({
							fromPath: path.resolve(wasmRoot),
							fromName: 'index.html',
							toPath: path.resolve(wasmRoot),
							toName: 'notification.html'
						});
					} else {
						copyFileArray.push({
							fromPath: path.resolve(
								'./node_modules/@trustwallet/wallet-core/dist/lib/'
							),
							fromName: 'wallet-core.wasm',
							toPath: path.resolve(wasmRoot + 'js/'),
							toName: 'wallet-core.wasm'
						});
					}

					chain
						.plugin('copy-index-html')
						.use(CopyWebpackPlugin, [copyFileArray]);
				}

				if (isClient && !isBex) {
					chain.plugin('css-minimizer-webpack-plugin').use(CssMinimizerPlugin, [
						{
							parallel: true,
							minimizerOptions: {
								preset: [
									'default',
									{
										mergeLonghand: true,
										cssDeclarationSorter: 'concentric',
										discardComments: { removeAll: true }
									}
								]
							}
						}
					]);

					chain.optimization.minimizer('terser').use(TerserPlugin, [
						{
							terserOptions: {
								parallel: true,
								sourceMap: true,
								extractComments: false,
								compress: {
									drop_console: true,
									drop_debugger: true,
									pure_funcs: ['console.log']
								},
								output: {
									comments: false,
									ascii_only: true
								}
							}
						}
					]);

					chain.optimization.splitChunks({
						chunks: 'all', // The type of chunk that requires code segmentation
						minSize: 20000, // Minimum split file size
						minRemainingSize: 0, // Minimum remaining file size after segmentation
						minChunks: 1, // The number of times it has been referenced before it is split
						maxAsyncRequests: 30, // Maximum number of asynchronous requests
						maxInitialRequests: 30, // Maximum number of initialization requests
						enforceSizeThreshold: 50000,
						cacheGroups: {
							// Cache Group configuration
							defaultVendors: {
								test: /[\\/]node_modules[\\/]/,
								priority: -10,
								reuseExistingChunk: true
							},
							default: {
								minChunks: 2,
								priority: -20,
								reuseExistingChunk: true //	Reuse the chunk that has been split
							}
						}
					});
				}
			},
			afterBuild(params) {
				const isBex = ctx.modeName === 'bex';
				if (!isBex) {
					return;
				}
				const filePath = path.resolve(
					__dirname,
					'./dist/bex/UnPackaged/www/notification.html'
				);

				try {
					let data = fs.readFileSync(filePath, 'utf8');
					const updatedData = data.replace(/q-app/g, 'terminus-app-root');
					fs.writeFileSync(filePath, updatedData, 'utf8');
				} catch (err) {
					console.error(err);
				}

				try {
					const distDir = path.resolve(
						__dirname,
						params.quasarConf.build.distDir
					);

					// add css to shadow-dom
					const assetsPath = `${distDir}/www/css`;
					const cssFiles = fs
						.readdirSync(assetsPath)
						.filter((file) => file.endsWith('.css'));

					const cssArr = [];
					for (let index = 0; index < cssFiles.length; index++) {
						const cssfile = cssFiles[index];

						const cssContent = fs.readFileSync(
							`${assetsPath}/${cssfile}`,
							'utf8'
						);

						cssArr.push(cssContent);

						fs.writeFileSync(
							`${distDir}/js/cssContent.json`,
							JSON.stringify({ data: cssArr })
						);
					}
				} catch (error) {
					/* empty */
				}
			}
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-devServer
		devServer: {
			server: {
				type: 'http'
			},
			port: process.env.DEV_PORT,
			open: true, // opens browser window automatically
			proxy: {
				'/api/controllers': {
					target: `https://agent.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true
				},
				'/bfl': {
					target: `https://vault.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true
				},
				'/server': {
					target: `https://vault.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true
				},
				'/sign': {
					target: 'http://127.0.0.1:3190',
					changeOrigin: true,
					pathRewrite: {
						'^/sign': 'sign'
					}
				},
				// '/message': {
				// 	target: 'https://message.cat.myterminus.com/',
				// 	changeOrigin: true,
				// 	pathRewrite: {
				// 		'^/message': 'message'
				// 	}
				// 	//ws: true, // proxy websockets
				// },
				'/create_local': {
					target: 'https://dev-obridge-lpnode.edge-dev.xyz/proxy/4010',
					changeOrigin: true,
					pathRewrite: {
						'^/create_local': 'create_local'
					}
					//ws: true, // proxy websockets
				},
				'/get_application_schema': {
					target: 'https://vc-gate-v2.edge-dev.xyz',
					changeOrigin: true,
					pathRewrite: {
						'^/get_application_schema': 'get_application_schema'
					}
				},
				'/get_facebook_info': {
					target: 'https://vc-gate-v2.edge-dev.xyz',
					changeOrigin: true,
					pathRewrite: {
						'^/get_facebook_info': 'get_facebook_info'
					}
				},
				'/submit_presentation': {
					target: 'https://vc-gate-v2.edge-dev.xyz',
					changeOrigin: true,
					pathRewrite: {
						'^/submit_presentation': 'submit_presentation'
					}
				},
				'/request_twitter_auth': {
					target: 'https://vc-gate-v2.edge-dev.xyz',
					changeOrigin: true,
					pathRewrite: {
						'^/request_twitter_auth': 'request_twitter_auth'
					}
				},
				'/twitter_result': {
					target: 'https://vc-gate-v2.edge-dev.xyz',
					changeOrigin: true,
					pathRewrite: {
						'^/twitter_result': 'twitter_result'
					}
				},
				'/verifyAndCreateDomain': {
					target: ' https://vc-gate-v2-admin.edge-dev.xyz',
					changeOrigin: true,
					pathRewrite: {
						'^/verifyAndCreateDomain': 'verifyAndCreateDomain'
					}
				},
				'/verifyDomainPresentation': {
					target: ' https://vc-gate-v2-admin.edge-dev.xyz',
					changeOrigin: true,
					pathRewrite: {
						'^/verifyDomainPresentation': 'verifyDomainPresentation'
					}
				},

				'/seafile': {
					target: 'http://localhost:8000/',
					ws: true,
					changeOrigin: true,
					pathRewrite: {
						'^/seafile': ''
					}
				},

				'/upload': {
					target: `https://files.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true
				},

				'/api': {
					target: `https://files.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true
					// pathRewrite:{
					//   '^/api': 'api'
					// }
					//ws: true, // proxy websockets
				},
				'/second': {
					target: `https://auth.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true
				},
				'/files': {
					target: `https://files.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true
				},
				'/seahub': {
					target: `https://seafile.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true,
					secure: false,
					pathRewrite: {
						'^/seahub': ''
					}
				},
				'/seafhttp': {
					target: `https://seafile.${process.env.SERVER_PROXY_NNME}.myterminus.com/seafhttp`,
					changeOrigin: true,
					secure: false,
					pathRewrite: {
						'^/seafhttp': ''
					}
				},
				'/settingsApi': {
					target: `https://settings.${process.env.SERVER_PROXY_NNME}.myterminus.com`,
					changeOrigin: true,
					pathRewrite: {
						'^/settingsApi': ''
					}
				}
			}
		},

		// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#Property%3A-framework
		framework: {
			config: {
				// dark: false, // 或者Boolean true/false
				dark: false, //ctx.modeName === 'capacitor' ? true : 'auto',
				capacitor: {
					backButton: false
				}
			},

			// iconSet: 'material-icons', // Quasar icon set
			// lang: 'en-US', // Quasar language pack

			// For special cases outside of where the auto-import strategy can have an impact
			// (like functional components as one of the examples),
			// you can manually specify Quasar components/directives to be available everywhere:
			//
			// components: [],
			// directives: [],

			// Quasar plugins
			plugins: ['Dialog', 'Notify', 'Loading', 'Cookies']
		},

		// animations: 'all', // --- includes all animations
		// https://quasar.dev/options/animations
		animations: [],

		// https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
		ssr: {
			pwa: false,

			// manualStoreHydration: true,
			// manualPostHydrationTrigger: true,

			prodPort: 3000, // The default port that the production server should use
			// (gets superseded if process.env.PORT is specified at runtime)

			maxAge: 1000 * 60 * 60 * 24 * 30,
			// Tell browser when a file from the server should expire from cache (in ms)

			// chainWebpackWebserver (/* chain */) {},

			middlewares: [
				ctx.prod ? 'compression' : '',
				'render' // keep this as last one
			]
		},

		// https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
		pwa: {
			workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
			workboxOptions: {}, // only for GenerateSW

			// for the custom service worker ONLY (/src-pwa/custom-service-worker.[js|ts])
			// if using workbox in InjectManifest mode
			// chainWebpackCustomSW (/* chain */) {},

			manifest: {
				name: 'Quasar App',
				short_name: 'Quasar App',
				description: '',
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#ffffff',
				theme_color: '#027be3',
				icons: [
					{
						src: 'icons/icon-128x128.png',
						sizes: '128x128',
						type: 'image/png'
					},
					{
						src: 'icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icons/icon-256x256.png',
						sizes: '256x256',
						type: 'image/png'
					},
					{
						src: 'icons/icon-384x384.png',
						sizes: '384x384',
						type: 'image/png'
					},
					{
						src: 'icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			}
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
		cordova: {
			// noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
		capacitor: {
			hideSplashscreen: true
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
		electron: {
			bundler: 'builder',

			builder: {
				// https://www.electron.build/configuration/configuration
				appId: 'com.terminus.planetam',
				mac: macConfig.mac,
				win: winConfig.win,
				nsis: winConfig.nsis,
				afterSign: require('./build/electron/afterSign')
			},

			// "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
			chainWebpackMain(/* chain */) {
				// do something with the Electron main process Webpack cfg
				// extendWebpackMain also available besides this chainWebpackMain
			},

			// "chain" is a webpack-chain object https://github.com/neutrinojs/webpack-chain
			chainWebpackPreload(/*chain*/) {
				// do something with the Electron main process Webpack cfg
				// extendWebpackPreload also available besides this chainWebpackPreload
			},

			extendPackageJson: require('./build/electron/extendPackageJson')
		},
		sourceFiles: {
			indexHtmlTemplate:
				process.env.PLATFORM === 'FILES'
					? 'src/index.template.files.html'
					: process.env.PLATFORM === 'WEB'
					? 'src/index.template.vault.html'
					: 'src/index.template.html'
		},
		htmlVariables: {
			productName:
				process.env.PLATFORM === 'FILES'
					? 'Files'
					: process.env.PLATFORM === 'WEB'
					? 'Vault'
					: 'TermiPass'
		}
	};
});

function changeQuasarFile(qusarEntryPath, customEntryPath, contentFormat) {
	const copyClentEntryFilePath = path.resolve(__dirname, customEntryPath);

	fs.access(copyClentEntryFilePath, fs.constants.F_OK, (err) => {
		if (err) {
			fs.copyFileSync(
				path.resolve(__dirname, qusarEntryPath),
				copyClentEntryFilePath
			);

			let fileContent = fs.readFileSync(copyClentEntryFilePath, 'utf8');
			fileContent = contentFormat ? contentFormat(fileContent) : fileContent;

			fs.writeFileSync(copyClentEntryFilePath, fileContent, 'utf8');
		}
	});
}
