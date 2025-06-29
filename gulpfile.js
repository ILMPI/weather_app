const { src, dest, watch, parallel, series } = require('gulp');
require('dotenv').config();
const replace = require('gulp-replace');

const sass = require('gulp-dart-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const { existsSync } = require('fs');
const fileinclude = require('gulp-file-include');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const cfg = require('./package.json').config;
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const terser = require('gulp-terser');
const browserslist = ['> 1%, last 3 versions, not dead'];

function html() {
	return src([cfg.srcDir + '/*.html'])
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: '@file',
			}),
		)
		.pipe(dest(cfg.outputDir))
		.pipe(browserSync.stream({ once: true }));
}
function htmlMin() {
	return src([cfg.srcDir + '/*.html'])
		.pipe(
			fileinclude({
				prefix: '@@',
				basepath: '@file',
			}),
		)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(cfg.outputDir));
}

// experimental
// converts otf to ttf, woff, woff2
// needs gulp-fonter
// not stable

// async function fontsOTF() {
// 	const fonter = (await import('gulp-fonter')).default;
// 	const ttf2woff2 = (await import('gulp-ttf2woff2')).default;

// 	return src('src/fonts/**/*.{ttf,otf}', { encoding: false })
// 		.pipe(plumber({ errorHandler: notify.onError('Font Error: <%= error.message %>') }))
// 		.pipe(fonter({ formats: ['ttf', 'woff'] }))
// 		.pipe(dest('app/fonts'))
// 		.pipe(src('src/fonts/**/*.ttf'))
// 		.pipe(ttf2woff2())
// 		.pipe(dest('app/fonts'));
// }

function replaceEnvVars() {
	let stream = scriptsRaw();
	for (const key in process.env) {
		if (Object.hasOwnProperty.call(process.env, key)) {
			const value = process.env[key];
			if (typeof value === 'string') {
				stream = stream.pipe(replace(`process.env.${key}`, JSON.stringify(value)));
			}
		}
	}
	return stream;
}

function scriptsRaw() {
	return src(cfg.srcDir + 'js/**/*.js').pipe(
		plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }),
	);
}

function scripts() {
	return replaceEnvVars()
		.pipe(concat('script.min.js'))
		.pipe(terser())
		.pipe(dest(cfg.outputDir + 'js'))
		.pipe(browserSync.stream({ once: true }));
}

async function fonts() {
	const ttf2woff2 = (await import('gulp-ttf2woff2')).default;

	// Check: if there is no folder, exit
	if (!existsSync('src/fonts')) {
		return;
	}
	// Copy the original fonts
	await new Promise(resolve => {
		src('src/fonts/**/*', { encoding: false }).pipe(dest('app/fonts')).on('end', resolve);
	});

	// Convert only .ttf to .woff2
	return src('src/fonts/**/*.ttf', { encoding: false })
		.pipe(plumber({ errorHandler: notify.onError('Font Error: <%= error.message %>') }))
		.pipe(ttf2woff2())
		.pipe(dest('app/fonts'));
}

function styles() {
	return src(cfg.srcDir + 'scss/**/*.{scss,sass}', { sourcemaps: true })
		.pipe(plumber({ errorHandler: notify.onError('Sass Error: <%= error.message %>') }))
		.pipe(
			sass({
				outputStyle: 'expanded', // expanded/compressed
				silenceDeprecations: ['legacy-js-api'], // Disable old API warnings
			}).on('error', sass.logError),
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: browserslist,
			}),
		)

		.pipe(dest(cfg.outputDir + 'css', { sourcemaps: '.' }))
		.pipe(browserSync.stream({ once: true }));
}

function stylesMin() {
	return (
		src(cfg.srcDir + 'scss/**/*.{scss,sass}', { sourcemaps: false })
			.pipe(
				sass({
					outputStyle: 'compressed', // expanded/compressed
					silenceDeprecations: ['legacy-js-api'], // Disable old API warnings
				}).on('error', sass.logError),
			)
			.pipe(
				autoprefixer({
					overrideBrowserslist: browserslist,
				}),
			)
			// .pipe(csso())
			.pipe(dest(cfg.outputDir + 'css'))
	);
}

// function scripts() {
// 	return src(cfg.srcDir + 'js/**/*.js')
// 		.pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
// 		.pipe(concat('script.min.js'))
// 		.pipe(terser())
// 		.pipe(dest(cfg.outputDir + 'js'))
// 		.pipe(browserSync.stream({ once: true }));
// }

function imageSync() {
	if (!existsSync('src/imgs')) {
		return Promise.resolve();
	}
	return src('src/imgs/**/*', { encoding: false })
		.pipe(dest('app/imgs'))
		.pipe(browserSync.stream({ once: true }));
}

async function imageSyncMin() {
	if (!existsSync('src/imgs')) {
		return Promise.resolve();
	}
	const imagemin = (await import('gulp-imagemin')).default;
	const imageminPngquant = (await import('imagemin-pngquant')).default;
	const imageminMozjpeg = (await import('imagemin-mozjpeg')).default;
	const imageminSvgo = (await import('imagemin-svgo')).default;

	return src('src/imgs/**/*', { encoding: false })
		.pipe(
			imagemin([
				imageminPngquant({ quality: [0.6, 0.8], speed: 1 }),
				imageminMozjpeg({ quality: 70, progressive: true }),
				imageminSvgo(),
			]),
		)
		.pipe(dest('app/imgs'))
		.pipe(browserSync.stream({ once: true }));
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: cfg.outputDir,
		},
	});
}

function watching() {
	watch([cfg.srcDir + 'scss/**/*.scss'], styles);
	watch([cfg.srcDir + 'js/**/*.js'], scripts);
	watch([cfg.srcDir + '/**/*.html'], html);
	watch([cfg.srcDir + 'imgs/**/*'], imageSync);
}

async function clean() {
	const { deleteSync } = await import('del');
	return deleteSync([cfg.outputDir]);
}

async function loadPrettier() {
	const prettier = await import('gulp-prettier');
	return prettier.default;
}

async function pretty() {
	const prettier = await loadPrettier();
	return src(['src/**/*', '!src/imgs/**/*']).pipe(prettier()).pipe(dest('src'));
}

exports.build = series(
	clean, // clean the folder
	htmlMin, // minified HTML
	fonts, // convert fonts to woff2
	stylesMin, // minified styles
	scripts, // minified scripts
	imageSyncMin, // minified images
);
exports.format = pretty;
exports.cssmin = stylesMin;
exports.default = parallel(html, fonts, styles, scripts, imageSync, watching, browsersync);
